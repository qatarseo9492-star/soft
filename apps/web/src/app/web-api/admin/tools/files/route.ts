export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
import { NextResponse } from "next/server";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
const ok=(d:any)=>NextResponse.json(d,{status:200,headers:{"Cache-Control":"no-store","X-Robots-Tag":"noindex, nofollow"}});
const LOCAL = (f:string)=>path.join(process.cwd(),"private_downloads",f);

export async function POST(req:Request){
  try{
    const body = await req.json() as { action:"mirrorCheck"|"hash"|"validateHash", file:string };
    if (!body?.file) return ok({ok:false,error:"file required"});

    if (body.action==="hash"){
      const fp = LOCAL(body.file);
      if (!fs.existsSync(fp)) return ok({ok:false,error:"not found"});
      const h = crypto.createHash("sha256");
      const stream = fs.createReadStream(fp);
      const dig = await new Promise<string>((resolve,reject)=>{
        stream.on("data",d=>h.update(d));
        stream.on("error",reject);
        stream.on("end",()=>resolve(h.digest("hex")));
      });
      const size = (await fsp.stat(fp)).size;
      return ok({ok:true, sha256:dig, size});
    }

    if (body.action==="validateHash"){
      const fp = LOCAL(body.file);
      if (!fs.existsSync(fp)) return ok({ok:false,error:"not found"});
      const given = (body as any).sha256 || "";
      const h = crypto.createHash("sha256");
      const stream = fs.createReadStream(fp);
      const dig = await new Promise<string>((resolve,reject)=>{
        stream.on("data",d=>h.update(d));
        stream.on("error",reject);
        stream.on("end",()=>resolve(h.digest("hex")));
      });
      return ok({ok:true, matches: given && given.toLowerCase()===dig, expected:dig});
    }

    if (body.action==="mirrorCheck"){
      const out:any = { local:false, size:0, cdn:null };
      const fp = LOCAL(body.file);
      if (fs.existsSync(fp)){
        const st = await fsp.stat(fp); out.local=true; out.size=st.size;
      }
      const origin = (process.env.DOWNLOAD_REDIRECT_BASE||"").replace(/\/+$/,"");
      if (origin){
        const t0 = Date.now();
        const res = await fetch(`${origin}/downloads/${encodeURIComponent(body.file)}`,{ method:"HEAD" });
        out.cdn = { ok: res.ok, status: res.status, ms: Date.now()-t0 };
      }
      return ok({ok:true, ...out});
    }

    return ok({ok:false,error:"unknown action"});
  }catch(e:any){return ok({ok:false,error:e?.message||String(e)})}
}
