"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useConvexUser } from "@/lib/useConvexUser";
import { format } from "date-fns";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import { UserRole } from "@/types/global";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const ROLE_STYLE: Record<string, string> = {
  admin: "bg-[#ede9fe] text-[#5b21b6]",
  officer: "bg-[#dbeafe] text-[#1e40af]",
  pensioner: "bg-[#dcfce7] text-[#166534]",
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
      await updateRole({ userId, role, updatedByUserId: convexUserId });
      toast.success("Role updated");
    } catch (e) {
      toast.error(getErrorMessage(e, "Failed"));
    }
  }

  if (!isAdmin) {
    return (
      <div className='flex flex-col items-center justify-center gap-3 h-[calc(100vh-50px)]'>
        <span className='text-[40px]'>🔒</span>
        <p className='text-[13px] text-slate'>
          Admin access required to manage users.
        </p>
      </div>
    );
  }

  return (
    <div className='overflow-y-auto h-[calc(100vh-50px)] bg-offwhite'>
      {/* Page header */}
      <div className='bg-white border-b border-mist px-5 py-3 flex items-center justify-between sticky top-0 z-10'>
        <h2 className='text-[15px] font-bold text-ink flex items-center gap-2'>
          🔑 User Accounts
          {users && (
            <span className='text-[9px] font-semibold bg-g1 text-white px-2 py-0.5 rounded-full'>
              {users.length}
            </span>
          )}
        </h2>
        <span className='text-[10px] text-slate hidden sm:block'>
          Manage system access · roles · active status
        </span>
      </div>

      <div className='p-4 space-y-4'>
        {/* Info banner */}
        <div className='flex gap-3 bg-white border border-mist rounded-[10px] px-4 py-3 shadow-[0_1px_4px_rgba(0,50,0,0.06)]'>
          <span className='text-[18px] shrink-0'>ℹ️</span>
          <p className='text-[11.5px] text-slate leading-relaxed'>
            <strong className='text-g1'>Adding users:</strong> New users sign up
            via the sign-in page. Set their role by editing Public Metadata in
            the Clerk dashboard:{" "}
            <code className='bg-smoke text-g1 font-mono text-[10px] px-1.5 py-0.5 rounded-md'>
              {`{ "role": "officer" }`}
            </code>
            . Then link pensioner users via the button below.
          </p>
        </div>

        {/* Table card */}
        <div className='bg-white border border-mist rounded-[11px] overflow-hidden shadow-[0_1px_4px_rgba(0,50,0,0.06)]'>
          <div className='overflow-x-auto'>
            <table className='w-full border-collapse text-sm'>
              <thead>
                <tr>
                  {[
                    "User",
                    "Email",
                    "Last Login",
                    "Role",
                    "Active",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className='bg-g1 text-white text-left text-[9px] font-semibold tracking-[0.4px] uppercase px-4 py-2.5'>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {users === undefined
                  ? [...Array(5)].map((_, i) => (
                      <tr key={i} className='border-b border-smoke'>
                        {[...Array(6)].map((_, j) => (
                          <td key={j} className='px-4 py-3'>
                            <Skeleton className='h-3 w-full rounded-md bg-smoke animate-pulse' />
                          </td>
                        ))}
                      </tr>
                    ))
                  : users.map((user, idx) => (
                      <tr
                        key={user._id}
                        className={cn(
                          "border-b border-smoke transition-colors duration-100",
                          idx % 2 === 0 ? "bg-white" : "bg-offwhite",
                          "hover:bg-[#f0faf0]",
                        )}>
                        {/* User */}
                        <td className='px-4 py-3'>
                          <div className='flex items-center gap-2.5'>
                            <div className='w-7 h-7 rounded-lg bg-g1 text-white text-[10px] font-bold flex items-center justify-center shrink-0'>
                              {user.username[0].toUpperCase()}
                            </div>
                            <span className='text-[11px] font-medium text-ink'>
                              {user.username}
                              {user._id === convexUserId && (
                                <span className='ml-2 text-[8px] font-semibold bg-g1 text-white px-1.5 py-0.5 rounded-md'>
                                  YOU
                                </span>
                              )}
                            </span>
                          </div>
                        </td>

                        {/* Email */}
                        <td className='px-4 py-3'>
                          <span className='text-[11px] text-slate'>
                            {user.email}
                          </span>
                        </td>

                        {/* Last login */}
                        <td className='px-4 py-3 whitespace-nowrap'>
                          <span className='font-mono text-[10px] text-slate'>
                            {user.lastLogin
                              ? format(
                                  new Date(user.lastLogin),
                                  "dd MMM yyyy · HH:mm",
                                )
                              : "Never"}
                          </span>
                        </td>

                        {/* Role */}
                        <td className='px-4 py-3'>
                          {user._id === convexUserId ? (
                            <span
                              className={cn(
                                "text-[9px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-[0.3px]",
                                ROLE_STYLE[user.role],
                              )}>
                              {user.role}
                            </span>
                          ) : (
                            <select
                              value={user.role}
                              onChange={(e) =>
                                handleRole(user._id, e.target.value as UserRole)
                              }
                              className='bg-white border border-mist rounded-[7px] py-1 px-2 text-[10px] text-ink cursor-pointer outline-none focus:border-g1 transition-colors font-[inherit]'>
                              <option value='admin'>Admin</option>
                              <option value='officer'>Officer</option>
                              <option value='pensioner'>Pensioner</option>
                            </select>
                          )}
                        </td>

                        {/* Active toggle */}
                        <td className='px-4 py-3'>
                          <button
                            onClick={() => handleToggle(user._id)}
                            disabled={user._id === convexUserId}
                            className={cn(
                              "text-[9.5px] font-semibold px-2.5 py-1 rounded-[7px] border transition-all duration-150",
                              user.isActive
                                ? "bg-g1 text-white border-g1 hover:bg-g2"
                                : "bg-transparent text-slate border-mist hover:border-g1 hover:text-g1",
                              user._id === convexUserId &&
                                "opacity-40 cursor-not-allowed",
                            )}>
                            {user.isActive ? "Active" : "Inactive"}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className='px-4 py-3'>
                          {user.role === "pensioner" && !user.pensionerId ? (
                            <button
                              className='text-[9.5px] font-semibold px-2.5 py-1 rounded-[7px] border border-mist text-slate bg-transparent hover:border-g1 hover:text-g1 transition-all duration-150'
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
                          ) : user.pensionerId ? (
                            <span className='text-[9px] font-semibold text-g1 flex items-center gap-1'>
                              ✅ Linked
                            </span>
                          ) : null}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className='px-4 py-2.5 border-t border-smoke flex items-center justify-between'>
            <span className='text-[10.5px] text-slate]'>
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
