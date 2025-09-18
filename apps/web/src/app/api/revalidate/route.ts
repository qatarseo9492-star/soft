export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const token = req.headers.get('x-revalidate-token')
  if (token !== process.env.WEB_REVALIDATE_TOKEN) return NextResponse.json({ ok:false }, { status: 401 })
  try{
    const { paths = [] } = await req.json()
    // @ts-ignore
    const revalidated:any[] = []
    for (const p of paths) {
      // @ts-ignore
      await (global as any).revalidatePath?.(p)
      revalidated.push(p)
    }
    return NextResponse.json({ ok:true, revalidated })
  }catch(e:any){
    return NextResponse.json({ ok:false, error: e?.message })
  }
}
