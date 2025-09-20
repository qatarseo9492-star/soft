"use server";

export async function approveComment(id: string) {
  const key = process.env.ADMIN_API_KEY || "";
  await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ""}/web-api/admin/comments/${id}/approve`, {
    method: "POST",
    headers: { "x-admin-key": key },
    cache: "no-store",
  });
}

export async function deleteComment(id: string) {
  const key = process.env.ADMIN_API_KEY || "";
  await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ""}/web-api/admin/comments/${id}`, {
    method: "DELETE",
    headers: { "x-admin-key": key },
    cache: "no-store",
  });
}
