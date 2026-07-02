/**
 * 文件解析服务 — 支持 PDF / DOCX / TXT
 */

export async function parseFile(
  buffer: Buffer,
  fileType: string,
  fileName: string,
): Promise<string> {
  const ext = fileType.toLowerCase();

  if (ext === 'txt' || fileName.endsWith('.txt')) {
    return buffer.toString('utf-8');
  }

  if (ext === 'pdf' || fileName.endsWith('.pdf')) {
    return parsePdf(buffer);
  }

  if (
    ext === 'docx' ||
    ext === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.docx')
  ) {
    return parseDocx(buffer);
  }

  throw new Error(`不支持的文件格式: ${fileType}`);
}

async function parsePdf(buffer: Buffer): Promise<string> {
  const pdfParse = (await import('pdf-parse')).default;
  const data = await pdfParse(buffer);
  return data.text;
}

async function parseDocx(buffer: Buffer): Promise<string> {
  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

/**
 * 支持的文件类型
 */
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
] as const;

export const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt'] as const;

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
