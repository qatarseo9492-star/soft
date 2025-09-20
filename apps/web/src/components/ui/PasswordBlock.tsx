// apps/web/src/components/ui/PasswordBlock.tsx
import PasswordField from "./PasswordField";

export default function PasswordBlock({ password }: { password: string | null }) {
  return (
    <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
      <PasswordField password={password} compact />
      <p className="mt-1 text-[12px] text-gray-500">
        Use this password to extract the archive (ZIP/RAR). Click “Copy”.
      </p>
    </div>
  );
}
