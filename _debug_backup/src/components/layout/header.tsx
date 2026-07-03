'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { User } from '@supabase/supabase-js';

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
  }, []);

  const initials = user?.email?.slice(0, 2).toUpperCase() || user?.user_metadata?.name?.slice(0, 1) || '?';

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-border bg-card/80 backdrop-blur">
      <div className="mx-auto flex h-full max-w-4xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-foreground"
        >
          Resume Analyzer
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {!loading && user && (
            <Link
              href="/dashboard"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              工作台
            </Link>
          )}
          {!loading && user ? (
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
          ) : !loading ? (
            <Link href="/auth/signin">
              <Button variant="outline" size="sm">
                登录
              </Button>
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
