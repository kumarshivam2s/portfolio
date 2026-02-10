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
        return NextResponse.json(
          { error: "Unsupported content type" },
          { status: 400 },
        );
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
      // create a per-tab admin session token stored server-side
      const { createAdminSession } = await import("@/lib/adminSessions");
      const session = await createAdminSession(adminEmail);
      if (!session) {
        return NextResponse.json(
          { error: "Failed to create session" },
          { status: 500 },
        );
      }

      const token = session.token;

      // If the client expects HTML (regular form submit), return a small HTML page
      // that sets the token into sessionStorage and redirects to /admin
      const accept = request.headers.get("accept") || "";
      const isHtml = accept.includes("text/html");

      // Set an HTTP-only cookie for the admin token so other tabs and server-side checks can use it
      const cookieOpts = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60, // 1 hour
      };

      if (isHtml) {
        const html = `<!doctype html><html><head><meta charset="utf-8"></head><body><script>try{sessionStorage.setItem('admin_token','${token}');sessionStorage.setItem('admin_login_ts',String(Date.now()));}catch(e){}window.location.href='/admin';</script></body></html>`;
        const resp = new NextResponse(html, {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
        resp.cookies.set("admin_token", token, cookieOpts);
        return resp;
      }

      // JSON response for XHR/fetch clients — client should save token in sessionStorage
      const resp = NextResponse.json({
        success: true,
        message: "Login successful",
        admin: true,
        admin_token: token,
      });
      resp.cookies.set("admin_token", token, cookieOpts);
      return resp;
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
