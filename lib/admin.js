export async function isAdminRequest(request) {
  try {
    const cookieToken = request.cookies.get("admin_token")?.value;
    const headerToken = request.headers?.get("x-admin-token");
    const token = headerToken || cookieToken;
    if (!token) return false;
    const { isValidAdminToken } = await import("@/lib/adminSessions");
    return await isValidAdminToken(token);
  } catch (e) {
    return false;
  }
}

// Client functions have moved to `lib/adminClient.js` to avoid bundling server-side modules into client code.
// Keep this file server-only: export server helpers here only.

// Note: Do not add client-side helpers here.
