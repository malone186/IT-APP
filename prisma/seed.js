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
  console.log('Starting seeding...');
  
  // 기존 데이터 클리어 (순서 유의)
  await prisma.message.deleteMany();
  await prisma.log.deleteMany();
  await prisma.task.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.user.deleteMany();

  // 1. 사용자 시딩
  const users = [
    { id: '1', name: '이우진', role: 'PM', avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80', online: true, username: 'woojin', password: '123' }
  ];

  for (const u of users) {
    await prisma.user.create({ data: u });
  }

  // 2. 마일스톤 시딩
  const milestones = [
    { id: 'm1', title: 'v1.0.0 Alpha 배포', startDate: '2026-06-20', endDate: '2026-07-05' },
    { id: 'm2', title: 'v1.0.0 Beta 테스트', startDate: '2026-07-06', endDate: '2026-07-20' }
  ];

  for (const m of milestones) {
    await prisma.milestone.create({ data: m });
  }

  // 3. 태스크 시딩
  const tasks = [
    { id: '1', title: 'DB 마이그레이션 전략 검토', description: 'SQLite에서 Neon PostgreSQL로의 스케일업 방안 및 브랜치 연동 계획 수립', status: 'DONE', priority: 'HIGH', assigneeId: '1', milestoneId: 'm1', completedAt: '2026-06-22' },
    { id: '2', title: '글로벌 테마 적용 및 레이아웃 설계', description: 'Tailwind 및 custom glassmorphism 테마를 사용한 메인 디자인 구성', status: 'IN_PROGRESS', priority: 'HIGH', assigneeId: '1', milestoneId: 'm1' },
    { id: '3', title: 'CI/CD 배포 파이프라인 구축', description: 'GitHub Actions 및 Vercel 자동 빌드 스크립트 작성 및 배포 테스트', status: 'IN_REVIEW', priority: 'MEDIUM', assigneeId: '1', milestoneId: 'm1' },
    { id: '4', title: '프로젝트 요구사항 정의서(PRD) 작성', description: '제품 요구사항 도출 및 스키마 설계 내용 최종 합의', status: 'DONE', priority: 'HIGH', assigneeId: '1', milestoneId: 'm1', completedAt: '2026-06-20' },
    { id: '5', title: '실시간 활동 로그 트래커 구현', description: '칸반 보드 내 상태 전이 이벤트를 로깅하고 대시보드에 피드로 렌더링', status: 'TODO', priority: 'LOW', assigneeId: '1', milestoneId: 'm2' }
  ];

  for (const t of tasks) {
    await prisma.task.create({ data: t });
  }

  // 4. 로그 시딩
  const logs = [
    { text: '이우진(PM)님이 "프로젝트 요구사항 정의서(PRD) 작성" 태스크를 완료했습니다.' },
    { text: '이우진(PM)님이 "DB 마이그레이션 전략 검토" 태스크를 완료했습니다.' }
  ];

  for (const l of logs) {
    await prisma.log.create({ data: l });
  }

  // 5. 메시지 시딩
  const messages = [
    { senderId: '1', receiverId: 'general', text: '이우진입니다. 이번 스프린트 v1.0.0 Alpha 목표일까지 마무리 부탁드립니다!' },
    { senderId: '1', receiverId: 'general', text: '데이터베이스 마이그레이션 검토 및 기본 스키마 연동이 완료되었습니다.' }
  ];

  for (const msg of messages) {
    await prisma.message.create({ data: msg });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
