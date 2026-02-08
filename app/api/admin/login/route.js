import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let email, password;

    if (contentType.includes("application/json")) {
      const body = await request.json();
      email = body.email;
      password = body.password;
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await request.text();
      const params = new URLSearchParams(text);
      email = params.get("email");
      password = params.get("password");
    } else {
      // try JSON as fallback
      try {
        const body = await request.json();
        email = body.email;
        password = body.password;
      } catch (e) {
        return NextResponse.json({ error: "Unsupported content type" }, { status: 400 });
      }
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    console.log("Login attempt - Email:", email);
    console.log("Admin email config:", adminEmail);

    if (!adminEmail) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    if (email === adminEmail && password === adminPassword) {
      // If the client expects HTML (regular form submit), redirect to /admin
      const accept = request.headers.get("accept") || "";

      const isHtml = accept.includes("text/html");

      if (isHtml) {
        const res = NextResponse.redirect(new URL("/admin", request.url));
        res.cookies.set("admin_token", "authenticated", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 60 * 24 * 7,
        });
        return res;
      }

      const response = NextResponse.json({
        success: true,
        message: "Login successful",
        admin: true,
      });

      // Set a secure admin cookie
      response.cookies.set("admin_token", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    }

    console.log("Invalid credentials");
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
