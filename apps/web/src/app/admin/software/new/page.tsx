import SoftwareForm from "@/components/admin/forms/SoftwareForm";

export const dynamic = "force-dynamic";

export default function NewSoftwarePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">New Software</h1>
      <SoftwareForm onSaved={(s) => (window.location.href = `/admin/software/${s.id}`)} />
    </div>
  );
}
