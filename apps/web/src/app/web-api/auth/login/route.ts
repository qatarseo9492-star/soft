export const dynamic="force-dynamic";
export const revalidate=0;
export const runtime="nodejs";
// apps/web/src/app/web-api/auth/login/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { login } from '../auth.service';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as any));
  if (!body?.email || !body?.password) {
    return NextResponse.json(
      { message: 'Email and password are required' },
      { status: 400 }
    );
  }

  try {
    const result = await login(body);
    return NextResponse.json(result, {
      status: 200,
      headers: { 'cache-control': 'no-store' },
    });
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message ?? 'Login failed' },
      { status: 401 }
    );
  }
}
