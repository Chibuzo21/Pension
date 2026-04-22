import { redirect } from "next/navigation";

// This route exists for legacy/direct links — send to the dashboard reports page.
export default function ReportsRedirect() {
  redirect("/dashboard/admin/reports");
}
