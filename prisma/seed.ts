import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const existing = await db.user.findUnique({
    where: { email: 'demo@example.com' },
  });
  if (existing) {
    console.log('Demo user already exists, skipping.');
    return;
  }

  const user = await db.user.create({
    data: {
      email: 'demo@example.com',
      name: '张小明',
      passwordHash: '$2b$10$placeholder_hash_for_dev_only',
      role: 'USER',
    },
  });

  const resume = await db.resume.create({
    data: {
      userId: user.id,
      originalFilename: 'demo_resume.pdf',
      fileType: 'PDF',
      fileSizeBytes: 102400,
      parsedText: `张小明\n前端工程师 | 3年经验\n技能: React, TypeScript, Vue.js, Node.js\n...`,
    },
  });

  const analysis = await db.analysis.create({
    data: {
      resumeId: resume.id,
      userId: user.id,
      status: 'COMPLETED',
      overallScore: 78,
      dimensionScores: JSON.stringify({
        completeness: 70,
        keywords: 82,
        format: 75,
        language: 85,
      }),
      llmModel: 'demo',
      startedAt: new Date(),
      completedAt: new Date(),
    },
  });

  await db.analysisResult.createMany({
    data: [
      {
        analysisId: analysis.id,
        dimension: 'COMPLETENESS',
        severity: 'HIGH',
        title: '缺少项目量化结果',
        description: '工作经历中没有使用具体数字描述成果。',
        suggestion: '添加量化指标，如"提升页面加载速度 40%"。',
        positionHint: '工作经历第1-3条',
      },
      {
        analysisId: analysis.id,
        dimension: 'KEYWORDS',
        severity: 'MEDIUM',
        title: '核心技能关键词密度不足',
        description: '"React" 出现了1次，"TypeScript" 未突出展示。',
        suggestion: '在技能列表和项目经历中更多地提及技术关键词。',
      },
      {
        analysisId: analysis.id,
        dimension: 'FORMAT',
        severity: 'LOW',
        title: '段落过长影响可读性',
        description: '部分段超过5行，HR快速浏览时容易跳过。',
        suggestion: '拆分为要点列表，每点不超过2行。',
      },
      {
        analysisId: analysis.id,
        dimension: 'LANGUAGE',
        severity: 'MEDIUM',
        title: '被动语态使用过多',
        description: '"负责"、"参与"等被动描述过多。',
        suggestion: '使用强动词开头，如"主导"、"设计"、"优化"。',
      },
    ],
  });

  console.log('✅ Seed complete!');
  console.log(`   Demo user: demo@example.com`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
