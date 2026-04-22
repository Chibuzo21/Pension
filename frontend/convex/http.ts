import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// Clerk webhook — syncs user creation/updates to Convex
http.route({
  path: "/api/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // ── Svix signature verification ──────────────────────────────
    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response("Missing svix headers", { status: 400 });
    }

    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("CLERK_WEBHOOK_SECRET is not set");
      return new Response("Webhook secret not configured", { status: 500 });
    }

    const body = await request.text();

    // Svix signs: "svix-id.svix-timestamp.body"
    const toSign = `${svixId}.${svixTimestamp}.${body}`;

    // Svix secrets are prefixed with "whsec_" followed by base64
    const secretBytes = Uint8Array.from(
      atob(webhookSecret.replace(/^whsec_/, "")),
      (c) => c.charCodeAt(0),
    );

    const key = await crypto.subtle.importKey(
      "raw",
      secretBytes,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );

    // svix-signature can contain multiple space-separated "v1,<base64>" values
    const signatures = svixSignature
      .split(" ")
      .map((s) => s.replace(/^v1,/, ""));

    const encoder = new TextEncoder();
    let verified = false;

    for (const sig of signatures) {
      try {
        const sigBytes = Uint8Array.from(atob(sig), (c) => c.charCodeAt(0));
        const ok = await crypto.subtle.verify(
          "HMAC",
          key,
          sigBytes,
          encoder.encode(toSign),
        );
        if (ok) {
          verified = true;
          break;
        }
      } catch {
        // Invalid base64 or wrong length — try next signature
      }
    }

    if (!verified) {
      return new Response("Invalid webhook signature", { status: 401 });
    }

    // ── Process event ────────────────────────────────────────────
    // Replace your process event block with this

    const { type, data } = JSON.parse(body);
    console.log("📨 Webhook event:", type); // is it even reaching here?

    if (type === "user.created" || type === "user.updated") {
      const clerkId = data.id;
      const email = data.email_addresses?.[0]?.email_address ?? "";
      const nin = data.unsafe_metadata?.nin as string | undefined;

      const username =
        (data.username ??
          `${data.first_name ?? ""}${data.last_name ?? ""}`.toLowerCase()) ||
        email.split("@")[0];

      const role = data.public_metadata?.role as
        | "admin"
        | "officer"
        | "pensioner"
        | undefined;

      console.log("👤 Processing:", { clerkId, email, nin, role });

      try {
        const convexUserId = await ctx.runMutation(api.users.upsertFromClerk, {
          clerkId,
          email,
          username,
          role,
        });
        console.log("✅ Upsert result:", convexUserId);

        if (convexUserId && nin) {
          const existingUser = await ctx.runQuery(api.users.getByClerkId, {
            clerkId,
          });
          if (!existingUser?.pensionerId) {
            const pensioner = await ctx.runQuery(api.pensioners.getByNin, {
              nin,
            });
            console.log("🔍 Pensioner found:", pensioner?._id ?? "none");

            if (pensioner) {
              await ctx.runMutation(api.users.linkToPensioner, {
                userId: convexUserId,
                pensionerId: pensioner._id,
                updatedByUserId: convexUserId,
              });
              await ctx.runAction(api.users.syncRoleToClerk, {
                clerkId,
                role: "pensioner",
              });

              console.log("🔗 Linked!");
            }
          }
        }
      } catch (err) {
        console.error("❌ Webhook processing error:", err); // 👈 this will show the real error
        return new Response("Processing error", { status: 500 });
      }
    }
    return new Response(null, { status: 200 });
  }),
});

export default http;
