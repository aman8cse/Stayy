const KEY = 'stayy_token';

export function getStoredToken() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function storeToken(token) {
  if (token) localStorage.setItem(KEY, token);
}

export function clearToken() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

export function setStoredToken(token) {
  if (token) localStorage.setItem(KEY, token);
  else localStorage.removeItem(KEY);
}
