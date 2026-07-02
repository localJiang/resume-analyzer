import type { Metadata } from 'next';
import { Providers } from '@/components/providers';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'Resume Analyzer — AI 驱动的简历分析工具',
  description:
    '上传简历，获取 AI 多维度分析和逐条改进建议，提升简历通过率。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">
        <Providers>
          {children}
          <Toaster position="top-center" richColors />
        </Providers>
      </body>
    </html>
  );
}
