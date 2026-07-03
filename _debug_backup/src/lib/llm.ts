/**
 * LLM 调用封装 — Anthropic 兼容 API
 */

interface LlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface LlmResponse {
  content: string;
  model: string;
}

export async function callLlm(
  messages: LlmMessage[],
  options?: { temperature?: number; maxTokens?: number },
): Promise<LlmResponse> {
  const apiKey = process.env.LLM_API_KEY;
  const baseUrl = process.env.LLM_BASE_URL || 'https://api.anthropic.com';
  const model = process.env.LLM_MODEL || 'deepseek-v4-pro';

  if (!apiKey) {
    throw new Error('LLM_API_KEY 未配置');
  }

  const systemMessage = messages.find((m) => m.role === 'system');
  const chatMessages = messages.filter((m) => m.role !== 'system');

  const body = {
    model,
    max_tokens: options?.maxTokens ?? 4096,
    temperature: options?.temperature ?? 0.3,
    ...(systemMessage ? { system: systemMessage.content } : {}),
    messages: chatMessages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  };

  const response = await fetch(`${baseUrl}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LLM API 调用失败 (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  // DeepSeek returns [thinking, text] — find the text block
  const textBlocks = (data.content as Array<{ type: string; text?: string }>)
    ?.filter((c) => c.type === 'text')
    .map((c) => c.text ?? '');
  const content = textBlocks?.join('') ?? '';

  return { content, model: data.model ?? model };
}
