'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import type { AnalysisRecord, AnalysisResultItem } from '@/types';

const dimensionLabels: Record<string, string> = {
  COMPLETENESS: '内容完整度',
  KEYWORDS: '关键词匹配',
  FORMAT: '格式规范',
  LANGUAGE: '语言表达',
};

const severityStyles: Record<string, 'destructive' | 'default' | 'secondary'> =
  {
    HIGH: 'destructive',
    MEDIUM: 'default',
    LOW: 'secondary',
  };

const severityLabels: Record<string, string> = {
  HIGH: '重要',
  MEDIUM: '建议',
  LOW: '可选',
};

export default function AnalysisPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const {
    data: analysis,
    isLoading,
    refetch,
  } = useQuery<AnalysisRecord>({
    queryKey: ['analysis', id],
    queryFn: async () => {
      const { apiFetch } = await import('@/lib/api-client');
      const res = await apiFetch(`/api/analysis/${id}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || '加载失败');
      }
      const json = await res.json();
      return json.data;
    },
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === 'PENDING' || data?.status === 'PROCESSING') {
        return 2000;
      }
      return false;
    },
  });

  async function handleReanalyze() {
    const { apiFetch } = await import('@/lib/api-client');
    const res = await apiFetch(`/api/analysis/${id}`, { method: 'PATCH' });
    if (!res.ok) {
      toast.error('重新分析失败');
      return;
    }
    toast.success('重新分析已启动');
    refetch();
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-4xl px-6 py-12">
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-28 w-28 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="mt-8 h-10 w-full rounded-lg" />
          <div className="mt-6 space-y-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </main>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-4xl px-6 py-12 text-center">
          <h1 className="text-2xl font-bold">分析记录不存在</h1>
        </main>
      </div>
    );
  }

  if (analysis.status === 'PROCESSING' || analysis.status === 'PENDING') {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-4xl px-6 py-12">
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-28 w-28 rounded-full" />
            <p className="text-sm text-muted-foreground">AI 正在分析你的简历...</p>
          </div>
          <Skeleton className="mt-8 h-10 w-full rounded-lg" />
          <div className="mt-6 space-y-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </main>
      </div>
    );
  }

  if (analysis.status === 'FAILED') {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-4xl px-6 py-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <p className="text-lg text-destructive">分析失败</p>
            <Button variant="outline" onClick={handleReanalyze}>
              <RefreshCw className="mr-2 h-4 w-4" />
              重新分析
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const results = (analysis.results || []) as AnalysisResultItem[];
  const dimensions = ['COMPLETENESS', 'KEYWORDS', 'FORMAT', 'LANGUAGE'] as const;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-4xl px-6 py-12">
        {/* Score */}
        <section className="flex flex-col items-center gap-3 pb-12">
          <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-primary/20">
            <span className="text-5xl font-bold text-primary">
              {analysis.overallScore ?? '—'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">综合评分</p>
          <Button variant="outline" size="sm" onClick={handleReanalyze}>
            <RefreshCw className="mr-2 h-3 w-3" />
            重新分析
          </Button>
        </section>

        {/* Tabs */}
        <Tabs defaultValue="all">
          <TabsList className="w-full">
            <TabsTrigger value="all">全部问题 ({results.length})</TabsTrigger>
            {dimensions.map((dim) => {
              const count = results.filter((r) => r.dimension === dim).length;
              return (
                <TabsTrigger key={dim} value={dim}>
                  {dimensionLabels[dim]} ({count})
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {results.map((item) => (
              <ResultCard key={item.id} item={item} />
            ))}
          </TabsContent>

          {dimensions.map((dim) => (
            <TabsContent key={dim} value={dim} className="space-y-4">
              {results
                .filter((r) => r.dimension === dim)
                .map((item) => (
                  <ResultCard key={item.id} item={item} />
                ))}
              {results.filter((r) => r.dimension === dim).length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  该维度没有问题
                </p>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
}

function ResultCard({ item }: { item: AnalysisResultItem }) {
  return (
    <Card className="transition-colors duration-200 hover:border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Badge variant={severityStyles[item.severity]}>
            {severityLabels[item.severity]}
          </Badge>
          <div>
            <CardTitle className="text-base font-semibold">
              {item.title}
            </CardTitle>
            {item.positionHint && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                📍 {item.positionHint}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{item.description}</p>
        <div className="mt-3 rounded-lg bg-muted/50 p-4">
          <p className="text-sm text-foreground">💡 {item.suggestion}</p>
        </div>
      </CardContent>
    </Card>
  );
}
