import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.error("[CLIENT_ERROR]", body);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[CLIENT_ERROR] Failed to parse", e);
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
