export async function uploadImage(file: File, softwareSlug: string){
  const fd = new FormData()
  fd.append('image', file)
  fd.append('softwareSlug', softwareSlug)
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/web-api/proxy/uploads/image`, {
  method: 'POST',
  body: fd,
});
  const json = await res.json()
  if(!json?.ok) throw new Error('Upload failed')
  return json.url as string
}
