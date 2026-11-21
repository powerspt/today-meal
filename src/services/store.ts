const STORE_URL = 'https://script.google.com/macros/s/AKfycbxBLNBLZ9iX23cb1IKqpF7144eqlnSwK1zz3bKPt9Vzy7ICXgyKGKEMfnMVhmRcr5HP/exec';
const APP = 'today-meal';

export interface StoreItem<T = Record<string, any>> {
  id: string;
  time: string;
  user?: string | null;
  private?: boolean;
  data: T;
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(APP + ':token');
  } catch (e) {
    return null;
  }
}

export function setToken(t: string | null): void {
  try {
    if (t) localStorage.setItem(APP + ':token', t);
    else localStorage.removeItem(APP + ':token');
  } catch (e) {}
}

export async function store(action: string, payload: Record<string, any> = {}): Promise<any> {
  const token = getToken();
  if (action === 'me' && !token) throw Object.assign(new Error('로그인하지 않았어요.'), { code: 'login' });
  let res, out;
  try {
    res = await fetch(STORE_URL, { method: 'POST', body: JSON.stringify({ ...payload, action, app: APP, token }) });
  } catch (e) {
    throw Object.assign(new Error('저장소에 연결하지 못했어요. 잠시 뒤 다시 해 보세요.'), { code: 'network' });
  }
  try {
    out = await res.json();
  } catch (e) {
    throw Object.assign(new Error('저장소의 대답을 읽지 못했어요. STORE_URL이 /exec로 끝나는 주소인지 확인하세요.'), { code: 'bad_response' });
  }
  if (out.token) setToken(out.token);
  if (action === 'logout' || out.code === 'login') setToken(null);
  if (!out.ok) throw Object.assign(new Error(out.error), { code: out.code });
  return out;
}
