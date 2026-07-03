import { db } from '@/lib/db';

/**
 * 验证用户并确保 Prisma 用户存在
 * 支持两种认证方式：
 * 1. Supabase session cookie（浏览器自动携带）
 * 2. Authorization: Bearer <token> header（手动传递）
 */
export async function ensureUser(request: Request): Promise<{ id: string; email: string }> {
  const { createClient } = await import('@/lib/supabase');
  const supabase = await createClient();

  // 先尝试从 cookie session 获取
  let { data: { user }, error } = await supabase.auth.getUser();

  // 如果 cookie 方式失败，尝试从 Authorization header 获取
  if (error || !user?.email) {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const { data, error: tokenError } = await supabase.auth.getUser(token);
      if (!tokenError && data.user?.email) {
        user = data.user;
        error = null;
      }
    }
  }

  if (error || !user?.email) {
    const msg = error
      ? `Auth error: ${error.message} (${error.status})`
      : 'No user found in session';
    throw new Error(msg);
  }

  let dbUser = await db.user.findUnique({
    where: { email: user.email },
  });

  if (!dbUser) {
    dbUser = await db.user.create({
      data: {
        email: user.email,
        name: user.user_metadata?.name || user.email.split('@')[0] || 'User',
        passwordHash: '',
      },
    });
  }

  return { id: dbUser.id, email: dbUser.email };
}
