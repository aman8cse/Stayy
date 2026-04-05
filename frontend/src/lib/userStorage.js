const USER_KEY = 'stayy_user';

export function getStoredUser() {
  try {
    const json = localStorage.getItem(USER_KEY);
    return json ? JSON.parse(json) : null;
  } catch {
    return null;
  }
}

export function storeUser(user) {
  try {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  } catch {
    // ignore
  }
}

export function isUserHost() {
  const user = getStoredUser();
  return user?.role === 'host';
}

export function clearUser() {
  try {
    localStorage.removeItem(USER_KEY);
  } catch {
    // ignore
  }
}
