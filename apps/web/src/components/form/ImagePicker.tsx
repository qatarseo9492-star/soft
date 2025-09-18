'use client'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

type Props = {
  value?: string | null
  onChange: (url: string | null) => void
  label?: string
  className?: string
}
export default function ImagePicker({ value, onChange, label = 'Image', className }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [url, setUrl] = useState(value ?? '')

  async function doUpload(file: File) {
    const fd = new FormData()
    fd.append('image', file)
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/web-api/proxy/uploads/image`, {
      method: 'POST',
      body: fd
    })
    if (!res.ok) return toast.error('Upload failed')
    const data = await res.json()
    const link = data.url as string
    setUrl(link)
    onChange(link)
    toast.success('Uploaded')
  }

  return (
    <div className={className}>
      <div className="text-sm mb-2 text-gray-300">{label}</div>
      <div className="flex gap-3 items-center">
        <input
          value={url}
          onChange={(e) => { setUrl(e.target.value); onChange(e.target.value || null) }}
          placeholder="https://.../image.jpg"
          className="flex-1 rounded-md bg-black/30 border border-white/10 px-3 py-2"
        />
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
               onChange={(e) => { const f = e.target.files?.[0]; if (f) doUpload(f) }} />
        <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>Upload</Button>
      </div>
      {url ? <img src={url} alt="" className="mt-3 h-28 w-28 object-cover rounded-md border border-white/10" /> : null}
    </div>
  )
}
