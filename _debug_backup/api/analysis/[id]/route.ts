import { NextResponse, type NextRequest } from 'next/server';
import { ensureUser } from '@/lib/auth';
import { db } from '@/lib/db';

/**
 * GET /api/analysis/:id — 获取单次分析报告
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const { id } = await params;

  const analysis = await db.analysis.findUnique({
    where: { id },
    include: {
      resume: { select: { originalFilename: true, fileType: true } },
      results: { orderBy: [{ dimension: 'asc' }, { severity: 'asc' }] },
    },
  });

  if (!analysis || analysis.userId !== user.id) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: '分析记录不存在' } },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: analysis });
}

/**
 * PATCH /api/analysis/:id — 重新分析
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const { id } = await params;

  const analysis = await db.analysis.findUnique({
    where: { id },
    include: { resume: true },
  });

  if (!analysis || analysis.userId !== user.id) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: '分析记录不存在' } },
      { status: 404 },
    );
  }

  // 删除旧的 analysis（cascade 删除 results）
  await db.analysis.delete({ where: { id } });

  // 创建新的分析
  const { performAnalysis } = await import('@/services/analysis.service');
  try {
    const newId = await performAnalysis(
      analysis.resumeId,
      analysis.resume.parsedText,
      user.id,
    );
    return NextResponse.json({ data: { id: newId } }, { status: 201 });
  } catch (error) {
    console.error('Re-analysis failed:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: '重新分析失败，请稍后重试' } },
      { status: 500 },
    );
  }
}
