"use client";

import { useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  height?: number;
};

export default function ClassicEditor({ value, onChange, height = 480 }: Props) {
  // TinyMCE’s type can differ per package version; keep this as `any` to avoid duplicate-type conflicts.
  const editorRef = useRef<any | null>(null);

  return (
    <div className="rounded-xl border bg-background/60">
      <Editor
        tinymceScriptSrc="https://cdn.jsdelivr.net/npm/tinymce@6.8.3/tinymce.min.js"
        onInit={(_evt, editor) => {
          editorRef.current = editor as any;
        }}
        initialValue={value}
        value={value}
        onEditorChange={(content) => onChange(content)}
        init={{
          height,
          menubar: "file edit view insert format tools table help",
          toolbar:
            [
              "undo redo | blocks | bold italic underline strikethrough forecolor backcolor",
              "| alignleft aligncenter alignright alignjustify | outdent indent",
              "| bullist numlist | hr | link image media table | codesample",
              "| removeformat | searchreplace | preview code fullscreen",
            ].join(" "),
          plugins:
            "anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks visualchars wordcount fullscreen preview code toc",
          // Show H1–H6 in the Blocks (format) dropdown
          block_formats:
            "Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4; Heading 5=h5; Heading 6=h6; Preformatted=pre",
          // Dark theme to match your site
          skin: "oxide-dark",
          content_css: "dark",
          // Quality-of-life tweaks
          branding: false,
          statusbar: true,
          elementpath: true,
          resize: true,
          image_advtab: true,
          // Allow common attributes/styles; keep permissive to preserve pasted HTML
          valid_elements: "*[*]",
          // Keep your Tailwind/shadcn tokens for content area
          content_style: `
            :root {
              color-scheme: dark;
            }
            body {
              background: transparent;
              color: hsl(var(--foreground));
              font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji;
              line-height: 1.6;
            }
            a { color: hsl(190 90% 70%); }
            a:hover { color: hsl(190 90% 78%); }
            h1,h2,h3,h4,h5,h6 { color: hsl(var(--foreground)); }
            table, td, th { border-color: hsl(var(--border)); }
            pre, code { background: hsl(var(--muted) / 0.25); }
          `,
        }}
      />
    </div>
  );
}
