import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateAccessToken, getTokenExpiryDate } from "@/lib/token";

const TOKEN_COOKIE_NAME = "access_token";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    console.log("[LOGIN] Attempt:", { username });

    if (!username || !password) {
      console.log("[LOGIN] Missing credentials");
      return NextResponse.json(
        { error: "Username dan password wajib diisi" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      console.log("[LOGIN] User not found:", username);
      return NextResponse.json(
        { error: "Username atau password salah" },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log("[LOGIN] Invalid password for:", username);
      return NextResponse.json(
        { error: "Username atau password salah" },
        { status: 401 }
      );
    }

    // Generate access token
    const accessToken = generateAccessToken();
    const tokenExpires = getTokenExpiryDate();

    // Save token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        accessToken,
        tokenExpires,
      },
    });

    console.log("[LOGIN] Success - Token generated:", { 
      id: user.id, 
      username: user.username, 
      role: user.role,
      tokenExpires 
    });

    // Return user data without password
    const { password: _, accessToken: _token, tokenExpires: _exp, ...userWithoutPassword } = user;
    
    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      user: userWithoutPassword,
    });

    // Set HTTP-only cookie
    // Note: secure:false allows HTTP access (for local network use)
    response.cookies.set({
      name: TOKEN_COOKIE_NAME,
      value: accessToken,
      httpOnly: true,
      secure: false, // Set false to allow HTTP access on local network
      sameSite: "lax", // lax works better for HTTP
      expires: tokenExpires,
      path: "/",
    });

    console.log("[LOGIN] Cookie set:", TOKEN_COOKIE_NAME);

    return response;
  } catch (error) {
    console.error("[LOGIN] Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
