"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useConvexUser } from "@/lib/useConvexUser";
import { format } from "date-fns";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import { UserRole } from "@/types/global";

const ROLE_STYLE: Record<string, string> = {
  admin: "background:#ede9fe; color:#5b21b6",
  officer: "background:#dbeafe; color:#1e40af",
  pensioner: "background:#dcfce7; color:#166534",
};

export default function UsersPage() {
  const { convexUserId, isAdmin } = useConvexUser();
  const users = useQuery(api.users.list);
  const toggleActive = useMutation(api.users.toggleActive);
  const updateRole = useMutation(api.users.updateRole);
  const linkToP = useMutation(api.users.linkToPensioner);

  async function handleToggle(userId: Id<"users">) {
    if (!convexUserId) return;
    try {
      await toggleActive({ userId, updatedByUserId: convexUserId });
    } catch (e) {
      toast.error(getErrorMessage(e, "Failed"));
    }
  }

  async function handleRole(userId: Id<"users">, role: UserRole) {
    if (!convexUserId || userId === convexUserId) {
      toast.error("Cannot change your own role");
      return;
    }
    try {
      await updateRole({
        userId,
        role: role,
        updatedByUserId: convexUserId,
      });
      toast.success("Role updated");
    } catch (e) {
      toast.error(getErrorMessage(e, "Failed"));
    }
  }

  if (!isAdmin) {
    return (
      <div className='flex items-center justify-center flex-col gap-3 h-[calc(100vh-50px)]'>
        <span className='text-[40px]'>🔒</span>
        <p className='text-[13px] text-muted-foreground'>
          Admin access required to manage users.
        </p>
      </div>
    );
  }

  return (
    <div className='overflow-y-auto h-[calc(100vh-50px)]'>
      <div className='bg-white border-b border-mist px-5 py-3 flex items-center justify-between '>
        <h2 className='text-[15px] font-bold'>
          🔑 User Accounts
          {users && (
            <small className='ml-2 text-muted-foreground text-[10px]'>
              {users.length} users
            </small>
          )}
        </h2>
        <span style={{ fontSize: 10, color: "var(--muted)" }}>
          Manage system access · roles · active status
        </span>
      </div>

      <div className='p-4'>
        {/* How to add users note */}
        <div className='mb-6 p-4 rounded-lg border border-muted/50 bg-muted/20 text-sm '>
          <strong className='text-g1'>Adding users:</strong> New users sign up
          via the sign-in page. Set their role by editing Public Metadata in the
          Clerk dashboard:{" "}
          <code className='bg-smoke text-g1 font-mono text-xs px-1 py-0.5 rounded-md'>{`{ "role": "officer" }`}</code>
          . Then link pensioner users via the button below.
        </div>

        <div className='tbl-card'>
          <div style={{ overflowX: "auto" }}>
            <table className='dtbl'>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Last Login</th>
                  <th>Role</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users === undefined
                  ? [...Array(5)].map((_, i) => (
                      <tr key={i}>
                        {[...Array(6)].map((_, j) => (
                          <td key={j}>
                            <div className='bg-smoke w-[80%] h-3 rounded-md animate-pulse' />
                          </td>
                        ))}
                      </tr>
                    ))
                  : users.map((user) => (
                      <tr key={user._id}>
                        <td>
                          <div className='flex items-center gap-2.5 '>
                            <div className='text-white flex items-center justify-center h-7 w-7 rounded-lg bg-g1 text-[10px] font-bold shrink-0 '>
                              {user.username[0].toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 600, fontSize: 11 }}>
                              {user.username}
                              {user._id === convexUserId && (
                                <span className='ml-2 text-[8px] font-medium bg-g1 text-white px-1.5 py-0.5 rounded-lg '>
                                  YOU
                                </span>
                              )}
                            </span>
                          </div>
                        </td>
                        <td className=' text-xs'>{user.email}</td>
                        <td className=' text-muted-foreground text-xs'>
                          {user.lastLogin
                            ? format(
                                new Date(user.lastLogin),
                                "dd MMM yyyy · HH:mm",
                              )
                            : "Never"}
                        </td>
                        <td>
                          {user._id === convexUserId ? (
                            <span className='audit-act bg-[#ede9fe] text-[#5b21b6]'>
                              {user.role}
                            </span>
                          ) : (
                            <select
                              value={user.role}
                              onChange={(e) =>
                                handleRole(user._id, e.target.value as UserRole)
                              }
                              className='cursor-pointer bg-white rounded-md border border-mist py-1 px-2 text-[10px]'
                              style={{ fontFamily: "inherit" }}>
                              <option value='admin'>Admin</option>
                              <option value='officer'>Officer</option>
                              <option value='pensioner'>Pensioner</option>
                            </select>
                          )}
                        </td>
                        <td>
                          <button
                            onClick={() => handleToggle(user._id)}
                            disabled={user._id === convexUserId}
                            className={`btn-sm ${user.isActive ? "bgreen" : "boutline"} `}
                            style={{
                              fontSize: 9.5,
                              padding: "2px 8px",
                              opacity: user._id === convexUserId ? 0.5 : 1,
                            }}>
                            {user.isActive ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td>
                          {user.role === "pensioner" && !user.pensionerId && (
                            <button
                              className='btn-sm boutline text-[9.5px] px-2 py-0.5'
                              onClick={() => {
                                const pid = window.prompt(
                                  "Enter Convex pensioner document ID to link:",
                                );
                                if (pid && convexUserId) {
                                  linkToP({
                                    userId: user._id,
                                    pensionerId: pid as Id<"pensioners">,
                                    updatedByUserId: convexUserId,
                                  })
                                    .then(() =>
                                      toast.success("Pensioner linked"),
                                    )
                                    .catch((e) =>
                                      toast.error(e.message ?? "Failed"),
                                    );
                                }
                              }}>
                              🔗 Link Pensioner
                            </button>
                          )}
                          {user.pensionerId && (
                            <span className='text-g1 text-[9px] font-medium'>
                              ✅ Linked
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
          <div className='tbl-foot'>
            <span>
              {users === undefined
                ? "Loading…"
                : `${users.length} system users`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
