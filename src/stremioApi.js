const API_BASE = "https://api.strem.io/api";

async function request(method, params = {}) {
  const resp = await fetch(`${API_BASE}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!resp.ok) {
    throw new Error(`Request failed with status ${resp.status}`);
  }

  const body = await resp.json();

  if (body.error) {
    const msg = typeof body.error === "object"
      ? body.error.message || JSON.stringify(body.error)
      : String(body.error);
    throw new Error(msg);
  }

  if (!body.result) {
    throw new Error("Response has no result");
  }

  return body.result;
}

export async function login(email, password) {
  const result = await request("login", { email, password });
  return result.authKey;
}

export async function register(email, password, gdprConsent) {
  const result = await request("register", { email, password, gdpr_consent: gdprConsent });
  return result.authKey;
}

export async function getAddons(authKey) {
  const result = await request("addonCollectionGet", { authKey });
  return result.addons;
}

export async function setAddons(authKey, addons) {
  const result = await request("addonCollectionSet", { authKey, addons });
  return result;
}
