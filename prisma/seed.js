const dotenv = require('dotenv');
const path = require('path');

// 환경 변수 명시적 로드 (.env.local 우선)
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is missing.');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Resetting and seeding base milestones...');
  
  // 데이터 클리어 (순서 유의)
  await prisma.message.deleteMany();
  await prisma.log.deleteMany();
  await prisma.task.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.user.deleteMany();

  // 기본 마일스톤 2개 복구
  const milestones = [
    { id: 'm1', title: '1차 디자인 및 핵심 화면 개발', startDate: '2026-06-20', endDate: '2026-07-10' },
    { id: 'm2', title: '2차 통합 테스트 및 최종 배포', startDate: '2026-07-11', endDate: '2026-07-30' }
  ];

  for (const m of milestones) {
    await prisma.milestone.create({ data: m });
  }

  console.log('Seeding milestones completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });


