import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isTokenExpired } from "@/lib/token";

const TOKEN_COOKIE_NAME = "access_token";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(TOKEN_COOKIE_NAME)?.value;

    console.log("[ME] Token check:", token ? "exists" : "none");

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { accessToken: token },
    });

    if (!user || isTokenExpired(user.tokenExpires)) {
      console.log("[ME] Invalid or expired token");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("[ME] User authenticated:", { id: user.id, username: user.username });

    // Return user without sensitive data
    const { password, accessToken, tokenExpires, ...userWithoutSensitive } = user;

    return NextResponse.json({
      success: true,
      user: userWithoutSensitive,
    });
  } catch (error) {
    console.error("[ME] Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
