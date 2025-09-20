// src/app/admin/layout.tsx
import "@/app/globals.css";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata = {
  title: "Filespay · Admin",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}

export const dynamic = "force-dynamic";
