// src/components/admin/software/new/page.tsx
import NewSoftwareForm from "@/components/admin/software/NewSoftwareForm";

export default function Page() {
  return (
    <div className="container-max py-8">
      <h1 className="text-2xl font-semibold mb-6">New software</h1>
      <NewSoftwareForm />
    </div>
  );
}
