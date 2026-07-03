import { NextResponse, type NextRequest } from 'next/server';
import { ensureUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { performAnalysis } from '@/services/analysis.service';

/**
 * POST /api/analysis — 创建 AI 分析
 */
export async function POST(request: NextRequest) {
  let user;
  try {
    user = await ensureUser(request);
  } catch (e) {
    const msg = e instanceof Error ? e.message : '请先登录';
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: msg } },
      { status: 401 },
    );
  }

  const { resumeId } = (await request.json()) as { resumeId?: string };

  if (!resumeId) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: '缺少 resumeId' } },
      { status: 400 },
    );
  }

  // 获取简历
  const resume = await db.resume.findUnique({ where: { id: resumeId } });
  if (!resume || resume.userId !== user.id) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: '简历不存在' } },
      { status: 404 },
    );
  }

  // 检查是否已有分析
  const existing = await db.analysis.findUnique({ where: { resumeId } });
  if (existing && existing.status === 'COMPLETED') {
    return NextResponse.json({ data: { id: existing.id } });
  }

  try {
    const analysisId = await performAnalysis(
      resume.id,
      resume.parsedText,
      user.id,
    );
    return NextResponse.json({ data: { id: analysisId } }, { status: 201 });
  } catch (error) {
    console.error('Analysis failed:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: '分析失败，请稍后重试' } },
      { status: 500 },
    );
  }
}

/**
 * GET /api/analysis — 获取用户的分析历史
 */
export async function GET(request: NextRequest) {
  let user;
  try {
    user = await ensureUser(request);
  } catch (e) {
    const msg = e instanceof Error ? e.message : '请先登录';
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: msg } },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const pageSize = Math.min(20, Math.max(1, parseInt(searchParams.get('pageSize') ?? '10', 10)));

  const [analyses, total] = await Promise.all([
    db.analysis.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        resume: { select: { originalFilename: true } },
      },
    }),
    db.analysis.count({ where: { userId: user.id } }),
  ]);

  return NextResponse.json({
    data: analyses,
    meta: { page, pageSize, total },
  });
}
