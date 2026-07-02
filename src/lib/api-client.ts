import { createBrowserClient } from '@supabase/ssr';

/**
 * 带认证的 fetch 封装 — 自动附加 Supabase access token
 * 仅在客户端组件中使用
 */
export async function apiFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const headers: Record<string, string> = {};
  if (options.headers) {
    for (const [key, value] of Object.entries(options.headers)) {
      if (typeof value === 'string') headers[key] = value;
    }
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  return fetch(url, { ...options, headers });
}
