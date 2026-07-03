'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Upload, FileText } from 'lucide-react';
import { toast } from 'sonner';
import type { AnalysisRecord } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const {
    data: analyses,
    isLoading,
    error,
  } = useQuery<AnalysisRecord[]>({
    queryKey: ['analyses'],
    queryFn: async () => {
      const { apiFetch } = await import('@/lib/api-client');
      const res = await apiFetch('/api/analysis');
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      return json.data;
    },
  });

  const handleFile = useCallback(
    async (file: File) => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!ext || !['pdf', 'docx', 'txt'].includes(ext)) {
        toast.error('不支持的文件格式，请上传 PDF / DOCX / TXT');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('文件大小不能超过 5MB');
        return;
      }

      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const { apiFetch } = await import('@/lib/api-client');

      const res = await apiFetch('/api/resume', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error?.message || '上传失败');
        setUploading(false);
        return;
      }

      const { data } = await res.json();
      toast.success('上传成功，开始分析...');

      const analysisRes = await apiFetch('/api/analysis', {
        method: 'POST',
        body: JSON.stringify({ resumeId: data.id }),
      });

      if (!analysisRes.ok) {
        toast.error('分析失败，请稍后重试');
        setUploading(false);
        return;
      }

      const { data: analysisData } = await analysisRes.json();
      toast.success('分析完成！');
      router.push(`/analysis/${analysisData.id}`);
    },
    [router],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleClick = () => fileInputRef.current?.click();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-4xl px-6 py-12">
        {/* Upload zone */}
        <Card
          className={`cursor-pointer border-2 border-dashed border-border py-12 text-center transition-all duration-200 hover:border-primary/30 ${
            uploading ? 'pointer-events-none opacity-50' : ''
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={handleClick}
        >
          <CardContent className="flex flex-col items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Upload className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="text-base font-medium text-foreground">
                {uploading
                  ? '上传分析中...'
                  : '拖拽简历文件到此处，或点击上传'}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                支持 PDF / DOCX / TXT，文件大小不超过 5MB
              </p>
            </div>
            <Button
              variant="outline"
              className="mt-2"
              disabled={uploading}
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
            >
              {uploading ? '处理中...' : '选择文件'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={handleChange}
            />
          </CardContent>
        </Card>

        {/* History */}
        <section className="mt-12">
          <h2 className="text-lg font-semibold text-foreground">最近分析</h2>

          {isLoading && (
            <div className="mt-6 space-y-4">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          )}

          {error && (
            <p className="mt-4 text-sm text-destructive">
              加载失败，请刷新重试
            </p>
          )}

          {analyses && analyses.length > 0 && (
            <div className="mt-6 space-y-3">
              {analyses.map((a) => (
                <Card
                  key={a.id}
                  className="cursor-pointer transition-colors hover:border-primary/30"
                  onClick={() => router.push(`/analysis/${a.id}`)}
                >
                  <CardContent className="flex items-center gap-4 py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">
                        {a.resume?.originalFilename || '未命名简历'}
                      </CardTitle>
                      <CardDescription>
                        {new Date(a.createdAt).toLocaleDateString('zh-CN')}
                        {a.status === 'COMPLETED' && a.overallScore != null
                          ? ` · 评分 ${a.overallScore}`
                          : ` · ${a.status === 'PROCESSING' ? '分析中' : a.status}`}
                      </CardDescription>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {analyses && analyses.length === 0 && (
            <Card className="mt-6 border-dashed py-16 text-center">
              <CardContent className="flex flex-col items-center gap-4">
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-muted">
                  <Upload className="h-12 w-12 text-muted-foreground/40" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    还没有分析记录
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    上传你的第一份简历，开始 AI 分析
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </section>
      </main>
    </div>
  );
}
