export function getToken() {
  return localStorage.getItem("access_token");
}

export function decodeJwtPayload(token) {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getUserFromToken(token) {
  if (!token) return { user_id: null, role: null };

  try {
    const payloadBase64 = token.split(".")[1];
    const payloadJson = atob(
      payloadBase64.replace(/-/g, "+").replace(/_/g, "/")
    );
    const payload = JSON.parse(payloadJson);

    return {
      user_id: payload.sub ? Number(payload.sub) : null,
      role: payload.role || null,
      is_admin: payload.is_admin ?? false,
    };
  } catch (e) {
    console.error("Token inválido:", e);
    return { user_id: null, role: null };
  }
}
