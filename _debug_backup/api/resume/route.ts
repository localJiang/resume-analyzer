import { NextResponse, type NextRequest } from 'next/server';
import { ensureUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { parseFile, MAX_FILE_SIZE } from '@/lib/parser';

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

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: '请上传文件' } },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: '文件大小不能超过 5MB' } },
      { status: 400 },
    );
  }

  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !['pdf', 'docx', 'txt'].includes(extension)) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: `不支持的文件格式: .${extension || 'unknown'}，请上传 PDF / DOCX / TXT`,
        },
      },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let parsedText: string;
  try {
    parsedText = await parseFile(buffer, extension, file.name);
  } catch {
    return NextResponse.json(
      { error: { code: 'PARSE_ERROR', message: '文件解析失败，请确认文件未被加密或损坏' } },
      { status: 422 },
    );
  }

  if (!parsedText || parsedText.trim().length < 10) {
    return NextResponse.json(
      { error: { code: 'PARSE_ERROR', message: '文件内容过短，无法进行分析' } },
      { status: 422 },
    );
  }

  const resume = await db.resume.create({
    data: {
      userId: user.id,
      originalFilename: file.name,
      fileType: extension.toUpperCase() as 'PDF' | 'DOCX' | 'TXT',
      fileSizeBytes: file.size,
      parsedText,
    },
  });

  return NextResponse.json({ data: resume }, { status: 201 });
}
