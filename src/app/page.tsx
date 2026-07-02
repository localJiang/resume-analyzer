import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Resume Analyzer
      </h1>
      <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
        AI 驱动的简历分析工具。上传简历文件，获取内容完整度、关键词匹配、
        格式规范和语言表达四个维度的评分与逐条改进建议。
      </p>
      <Link
        href="/auth/signup"
        className="mt-8 inline-flex h-11 items-center rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        开始分析
      </Link>
    </main>
  );
}
