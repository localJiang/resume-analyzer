import { db } from '@/lib/db';
import { callLlm } from '@/lib/llm';
import { SYSTEM_PROMPT, buildUserPrompt } from '@/prompts/analysis';

interface AnalysisResultInput {
  dimension: string;
  severity: string;
  title: string;
  description: string;
  suggestion: string;
  positionHint: string | null;
}

interface LlmAnalysisOutput {
  overallScore: number;
  dimensionScores: {
    completeness: number;
    keywords: number;
    format: number;
    language: number;
  };
  results: AnalysisResultInput[];
}

/**
 * 对简历执行 AI 分析
 */
export async function performAnalysis(resumeId: string, resumeText: string, userId: string): Promise<string> {
  // 1. 创建分析记录（状态：PROCESSING）
  const analysis = await db.analysis.create({
    data: {
      resumeId,
      userId,
      status: 'PROCESSING',
      llmModel: process.env.LLM_MODEL || 'deepseek-v4-pro',
      startedAt: new Date(),
    },
  });

  try {
    // 2. 调用 LLM
    const { content, model } = await callLlm([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(resumeText) },
    ]);

    // 3. 解析结果
    const parsed = parseAnalysisResponse(content);

    // 4. 存储分析结果
    await db.analysis.update({
      where: { id: analysis.id },
      data: {
        status: 'COMPLETED',
        overallScore: parsed.overallScore,
        dimensionScores: parsed.dimensionScores,
        llmModel: model,
        completedAt: new Date(),
      },
    });

    // 5. 存储逐条结果
    if (parsed.results.length > 0) {
      await db.analysisResult.createMany({
        data: parsed.results.map((r) => ({
          analysisId: analysis.id,
          dimension: r.dimension as 'COMPLETENESS' | 'KEYWORDS' | 'FORMAT' | 'LANGUAGE',
          severity: (r.severity?.toUpperCase() === 'HIGH'
            ? 'HIGH'
            : r.severity?.toUpperCase() === 'LOW'
              ? 'LOW'
              : 'MEDIUM') as 'HIGH' | 'MEDIUM' | 'LOW',
          title: r.title,
          description: r.description,
          suggestion: r.suggestion,
          positionHint: r.positionHint ?? null,
        })),
      });
    }

    return analysis.id;
  } catch (error) {
    // 标记为失败
    await db.analysis.update({
      where: { id: analysis.id },
      data: { status: 'FAILED' },
    });
    throw error;
  }
}

function parseAnalysisResponse(content: string): LlmAnalysisOutput {
  // 提取 JSON（处理可能的 markdown 代码块包裹）
  let jsonStr = content.trim();

  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch?.[1]) {
    jsonStr = jsonMatch[1].trim();
  }

  const parsed = JSON.parse(jsonStr) as LlmAnalysisOutput;

  // 基本校验
  if (typeof parsed.overallScore !== 'number' || !Array.isArray(parsed.results)) {
    throw new Error('LLM 返回格式不符合预期');
  }

  return parsed;
}
