import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();
  if (!admin) redirect("/");

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar user={admin} />
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
