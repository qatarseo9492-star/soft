export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import fss from "node:fs";
import path from "node:path";
const LOG = path.join(process.cwd(),"download_events.jsonl");
export async function GET(){
  try{
    if (!fss.existsSync(LOG)) return new NextResponse("ip,file,ts\n", { status:200, headers:{"content-type":"text/csv"}});
    const raw = await fs.readFile(LOG,"utf8");
    const lines = raw.trim().split(/\r?\n/).slice(-100000);
    const rows = ["ip,file,ts"];
    for(const ln of lines){
      try{ const j = JSON.parse(ln); rows.push(`${j.ip||""},${j.file||""},${j.ts||""}`);}catch{}
    }
    return new NextResponse(rows.join("\n")+"\n",{status:200,headers:{"content-type":"text/csv","cache-control":"no-store","x-robots-tag":"noindex, nofollow"}});
  }catch(e:any){ return new NextResponse("ip,file,ts\n", { status:200, headers:{"content-type":"text/csv"} }); }
}
