export function isAdminRequest(request) {
  try {
    return !!request.cookies.get("admin_token")?.value;
  } catch (e) {
    return false;
  }
}

export function isAdminSessionClient() {
  try {
    const ts = sessionStorage.getItem("admin_login_ts");
    return Boolean(ts && Date.now() - Number(ts) < 1000 * 60 * 60);
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
    sessionStorage.setItem("admin_view", JSON.stringify({ path, ts: Date.now() }));
  } catch (e) {}
}
