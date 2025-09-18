export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
import { NextResponse } from "next/server";
import { createSoftware, createVersion } from "@/app/web-api/_lib/software-store";
const ok=(d:any)=>NextResponse.json(d,{status:200,headers:{"Cache-Control":"no-store","X-Robots-Tag":"noindex, nofollow"}});
export async function POST(req:Request){
  try{
    const contentType = req.headers.get("content-type")||"";
    const out:any[]=[];
    if (contentType.includes("application/json")){
      const payload = await req.json() as Array<any>;
      for(const row of payload){
        const sw = await createSoftware(row);
        if (Array.isArray(row.versions)) {
          for(const v of row.versions){ await createVersion(sw.id, v); }
        }
        out.push(sw.id);
      }
      return ok({ok:true, created:out});
    }
    // CSV stub (send JSON for now)
    return ok({ok:false,error:"Send JSON array (CSV not yet wired)"});
  }catch(e:any){return ok({ok:false,error:e?.message||String(e)})}
}
