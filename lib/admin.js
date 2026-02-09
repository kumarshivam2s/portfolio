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

export function isAdminSessionClient() {
  try {
    const ts = sessionStorage.getItem("admin_login_ts");
    const token = sessionStorage.getItem("admin_token");
    return Boolean(token && ts && Date.now() - Number(ts) < 1000 * 60 * 60);
  } catch (e) {
    return false;
  }
}

export function getAdminLoginTs() {
  try {
    const ts = sessionStorage.getItem("admin_login_ts");
    return ts ? Number(ts) : null;
  } catch (e) {
    return null;
  }
}

export function setAdminViewForTab(path) {
  try {
    sessionStorage.setItem(
      "admin_view",
      JSON.stringify({ path, ts: Date.now() }),
    );
  } catch (e) {}
}

// Client helpers for per-tab tokens
export function getAdminTokenClient() {
  try {
    return sessionStorage.getItem("admin_token");
  } catch (e) {
    return null;
  }
}

export function setAdminTokenClient(token) {
  try {
    sessionStorage.setItem("admin_token", token);
    sessionStorage.setItem("admin_login_ts", String(Date.now()));
  } catch (e) {}
}

export function clearAdminTokenClient() {
  try {
    sessionStorage.removeItem("admin_token");
    sessionStorage.removeItem("admin_login_ts");
  } catch (e) {}
}

export function getAdminHeaders() {
  try {
    const t = getAdminTokenClient();
    return t ? { "x-admin-token": t } : {};
  } catch (e) {
    return {};
  }
}
