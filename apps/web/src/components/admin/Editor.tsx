"use client";
import { Editor } from "@tinymce/tinymce-react";

type Props = {
  value: string;
  onChange: (val: string) => void;
  height?: number;
};

export default function RichEditor({ value, onChange, height = 420 }: Props) {
  return (
    <Editor
      apiKey={process.env.NEXT_PUBLIC_TINYMCE_KEY || undefined}
      value={value}
      onEditorChange={onChange}
      init={{
        height,
        menubar: true,
        plugins:
          "anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount",
        toolbar:
          "undo redo | blocks | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist | link image media table | removeformat | code",
        toolbar_sticky: true,
        skin: "oxide-dark",
        content_css: "dark",
      }}
    />
  );
}
