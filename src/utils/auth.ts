export interface TokenInfo {
  accessToken: string;
  roles?: string[];
  username?: string;
}

export const TOKEN_KEY = 'authorized-token';

export function getToken(): null | TokenInfo {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    return raw ? (JSON.parse(raw) as TokenInfo) : null;
  } catch {
    return null;
  }
}

export function setToken(data: TokenInfo) {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(data));
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}
