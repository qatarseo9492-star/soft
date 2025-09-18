import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../../../lib/api';

type Status = 'PENDING'|'APPROVED'|'SPAM'|'TRASH'|'ALL';

export default function CommentsAdmin() {
  const [rows, setRows] = useState<any[]>([]);
  const [status, setStatus] = useState<Status>('PENDING');

  const load = async () => {
    const data = await apiGet(`/api/v1/comments?status=${status}`);
    setRows(data);
  };

  useEffect(()=> { load(); }, [status]);

  const act = async (id: string, action: 'approve'|'spam'|'trash'|'delete') => {
    await apiPost(`/api/v1/comments/${id}/${action}`, {});
    await load();
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Comments</h1>
      <select value={status} onChange={e=>setStatus(e.target.value as Status)} className="border rounded p-2">
        <option>PENDING</option><option>APPROVED</option><option>SPAM</option><option>TRASH</option><option>ALL</option>
      </select>
      <div className="space-y-3">
        {rows.map(c => (
          <div key={c.id} className="border rounded p-3">
            <div className="text-sm text-gray-500">{new Date(c.createdAt).toLocaleString()} on <b>{c.software?.name}</b></div>
            <div className="mt-2 whitespace-pre-wrap">{c.body}</div>
            <div className="mt-2 flex gap-2">
              {c.status!=='APPROVED' && <button onClick={()=>act(c.id,'approve')} className="px-2 py-1 border rounded">Approve</button>}
              {c.status!=='SPAM' && <button onClick={()=>act(c.id,'spam')} className="px-2 py-1 border rounded">Spam</button>}
              {c.status!=='TRASH' && <button onClick={()=>act(c.id,'trash')} className="px-2 py-1 border rounded">Trash</button>}
              <button onClick={()=>act(c.id,'delete')} className="px-2 py-1 border rounded">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
