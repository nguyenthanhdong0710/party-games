import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const systemPassword = process.env.SYSTEM_PASSWORD;

    if (!systemPassword) {
      return NextResponse.json(
        { success: false, message: "System password not configured" },
        { status: 500 }
      );
    }

    if (password === systemPassword) {
      const response = NextResponse.json({ success: true });

      // Set cookie với thời hạn 1 ngày
      response.cookies.set("auth_token", systemPassword, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24, // 1 ngày
        path: "/",
      });

      return response;
    }

    return NextResponse.json(
      { success: false, message: "Mật khẩu không đúng" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request" },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  const authToken = request.cookies.get("auth_token")?.value;
  const systemPassword = process.env.SYSTEM_PASSWORD;

  if (!systemPassword) {
    return NextResponse.json({ authenticated: false });
  }

  if (authToken && authToken === systemPassword) {
    return NextResponse.json({ authenticated: true });
  }

  return NextResponse.json({ authenticated: false });
}
