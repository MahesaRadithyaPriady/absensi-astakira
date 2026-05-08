import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const TOKEN_COOKIE_NAME = "access_token";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(TOKEN_COOKIE_NAME)?.value;

    console.log("[LOGOUT] Token:", token ? "exists" : "none");

    if (token) {
      // Clear token from database
      await prisma.user.updateMany({
        where: { accessToken: token },
        data: {
          accessToken: null,
          tokenExpires: null,
        },
      });
    }

    const response = NextResponse.json({
      success: true,
      message: "Logout berhasil",
    });

    // Clear cookie
    response.cookies.set({
      name: TOKEN_COOKIE_NAME,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0),
      path: "/",
    });

    console.log("[LOGOUT] Success - Cookie cleared");

    return response;
  } catch (error) {
    console.error("[LOGOUT] Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
