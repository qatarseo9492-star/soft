// src/app/admin/software/_ui/RichEditor.tsx
"use client";

import { Editor } from "@tinymce/tinymce-react";
import { useRef } from "react";

type Props = {
  value?: string;
  onChange: (html: string) => void;
  uploadFolder: string; // e.g. `posts/my-software`
};

export default function RichEditor({ value = "", onChange, uploadFolder }: Props) {
  const ref = useRef<any>(null);

  return (
    <div className="rounded-2xl border overflow-hidden">
      <Editor
        onInit={(_, editor) => (ref.current = editor)}
        value={value}
        onEditorChange={(c) => onChange(c)}
        init={{
          height: 520,
          menubar: "file edit view insert format tools table",
          plugins:
            "code lists link image table media autoresize searchreplace preview anchor charmap wordcount",
          toolbar:
            "undo redo | blocks | bold italic underline forecolor backcolor | " +
            "alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | " +
            "link image media table | removeformat | code preview",
          // Headings H1..H6
          block_formats: "Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4; Heading 5=h5; Heading 6=h6",
          // Let users paste images and upload them
          automatic_uploads: true,
          images_upload_handler: async (blobInfo) => {
            const fd = new FormData();
            fd.append("file", blobInfo.blob(), blobInfo.filename());
            fd.append("folder", uploadFolder);
            // You can also pass "webp=1" to force webp conversion on server (we’ll handle this)
            fd.append("webp", "1");

            const res = await fetch("/web-api/admin/upload", {
              method: "POST",
              body: fd,
            });
            const j = await res.json();
            if (!res.ok || !j?.ok || !j.url) {
              throw new Error(j?.error || "Upload failed");
            }
            return j.url; // TinyMCE will insert this URL
          },
          // Keep editor styles simple; page CSS will style content
          content_style:
            "body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Inter,Arial,sans-serif;line-height:1.6;}" +
            "img{max-width:100%;height:auto;}",
        }}
      />
    </div>
  );
}
