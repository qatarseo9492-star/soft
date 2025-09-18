'use client'
import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

type Link = { label?: string; url: string }
type Props = {
  value?: { external: Link[]; internal: Link[] }
  onChange: (v: { external: Link[]; internal: Link[] }) => void
  versionId?: string // optional: if provided, uploaded files will associate with this version via your API
}

export default function DownloadLinksEditor({ value, onChange, versionId }: Props) {
  const [state, setState] = useState<{ external: Link[]; internal: Link[] }>(value ?? { external: [], internal: [] })
  const fileRef = useRef<HTMLInputElement>(null)

  function commit(next: typeof state) { setState(next); onChange(next) }

  async function upload(file: File) {
    const fd = new FormData()
    fd.append('file', file)
    let api = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3011'
    let url = `${api}/v1/uploads/file`
    // Optional integration: create a build for version
    if (versionId) url = `${api}/v1/software/version/${versionId}/build`
    const res = await fetch(url, { method: 'POST', body: fd })
    if (!res.ok) return toast.error('Upload failed')
    const data = await res.json()
    const link = { label: data.name || file.name, url: data.url || data.downloadUrl || '' }
    commit({ ...state, internal: [...state.internal, link] })
    toast.success('File uploaded')
  }

  return (
    <div className="space-y-4">
      <h4 className="font-semibold">External Links</h4>
      <div className="space-y-3">
        {state.external.map((l, i) => (
          <div key={i} className="flex gap-2">
            <input
              className="w-40 rounded-md bg-black/30 border border-white/10 px-3 py-2"
              placeholder="Label"
              value={l.label ?? ''}
              onChange={e => {
                const copy = [...state.external]; copy[i] = { ...copy[i], label: e.target.value }
                commit({ ...state, external: copy })
              }}
            />
            <input
              className="flex-1 rounded-md bg-black/30 border border-white/10 px-3 py-2"
              placeholder="https://..."
              value={l.url}
              onChange={e => {
                const copy = [...state.external]; copy[i] = { ...copy[i], url: e.target.value }
                commit({ ...state, external: copy })
              }}
            />
            <Button variant="ghost" onClick={() => { const copy = state.external.filter((_, x) => x !== i); commit({ ...state, external: copy }) }}>Remove</Button>
          </div>
        ))}
        <Button variant="outline" onClick={() => commit({ ...state, external: [...state.external, { url: '' }] })}>Add external</Button>
      </div>

      <h4 className="font-semibold mt-6">Internal Files</h4>
      <input ref={fileRef} type="file" multiple className="hidden" onChange={(e) => {
        const files = e.target.files ? Array.from(e.target.files) : []
        files.forEach(upload)
      }} />
      <div className="space-y-2">
        {state.internal.map((l, i) => (
          <div key={i} className="flex items-center justify-between rounded-md bg-black/30 border border-white/10 px-3 py-2">
            <div className="truncate">{l.label || l.url}</div>
            <div className="flex gap-2">
              <a href={l.url} target="_blank" className="text-accent-400 hover:underline">Open</a>
              <Button variant="ghost" onClick={() => { const copy = state.internal.filter((_, x) => x !== i); commit({ ...state, internal: copy }) }}>Remove</Button>
            </div>
          </div>
        ))}
      </div>
      <Button variant="outline" onClick={() => fileRef.current?.click()}>Upload files</Button>
    </div>
  )
}
