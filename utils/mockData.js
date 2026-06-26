export const initialUsers = [
  { id: '1', name: '김철수', role: 'PM', avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80', online: true, username: 'chulsoo', password: '1234' },
  { id: '2', name: '이영희', role: 'FE', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80', online: true, username: 'younghi', password: '1234' },
  { id: '3', name: '박민수', role: 'BE', avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=80&h=80', online: false, username: 'minsu', password: '1234' },
  { id: '4', name: '최데브', role: 'DEVOPS', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80', online: true, username: 'dev', password: '1234' }
];

export const initialMilestones = [
  { id: 'm1', title: 'v1.0.0 Alpha 배포', startDate: '2026-06-20', endDate: '2026-07-05' },
  { id: 'm2', title: 'v1.0.0 Beta 테스트', startDate: '2026-07-06', endDate: '2026-07-20' }
];

export const initialTasks = [
  { id: '1', title: 'DB 마이그레이션 전략 검토', description: 'SQLite에서 Neon PostgreSQL로의 스케일업 방안 및 브랜치 연동 계획 수립', status: 'DONE', priority: 'HIGH', assigneeId: '3', milestoneId: 'm1', completedAt: '2026-06-22' },
  { id: '2', title: '글로벌 테마 적용 및 레이아웃 설계', description: 'Tailwind 및 custom glassmorphism 테마를 사용한 메인 디자인 구성', status: 'IN_PROGRESS', priority: 'HIGH', assigneeId: '2', milestoneId: 'm1' },
  { id: '3', title: 'CI/CD 배포 파이프라인 구축', description: 'GitHub Actions 및 Vercel 자동 빌드 스크립트 작성 및 배포 테스트', status: 'IN_REVIEW', priority: 'MEDIUM', assigneeId: '4', milestoneId: 'm1' },
  { id: '4', title: '프로젝트 요구사항 정의서(PRD) 작성', description: '제품 요구사항 도출 및 스키마 설계 내용 최종 합의', status: 'DONE', priority: 'HIGH', assigneeId: '1', milestoneId: 'm1', completedAt: '2026-06-20' },
  { id: '5', title: '실시간 활동 로그 트래커 구현', description: '칸반 보드 내 상태 전이 이벤트를 로깅하고 대시보드에 피드로 렌더링', status: 'TODO', priority: 'LOW', assigneeId: '2', milestoneId: 'm2' }
];

export const initialLogs = [
  { id: 'l1', timestamp: '2026-06-20T14:30:00Z', text: '김철수(PM)님이 "프로젝트 요구사항 정의서(PRD) 작성" 태스크를 완료했습니다.' },
  { id: 'l2', timestamp: '2026-06-22T15:12:00Z', text: '박민수(BE)님이 "DB 마이그레이션 전략 검토" 태스크를 완료했습니다.' }
];

export const initialMessages = [
  { id: 'msg1', senderId: '1', receiverId: 'general', text: '여러분 이번 스프린트 v1.0.0 Alpha 목표일까지 마무리 부탁드립니다!', timestamp: '2026-06-25T10:00:00Z' },
  { id: 'msg2', senderId: '2', receiverId: 'general', text: '넵, 프론트엔드는 글로벌 테마 적용 및 레이아웃 설계 거의 완료했습니다.', timestamp: '2026-06-25T10:05:00Z' },
  { id: 'msg3', senderId: '3', receiverId: 'general', text: '백엔드도 마이그레이션 끝났으니 API 테스트해 보실 수 있습니다.', timestamp: '2026-06-25T10:10:00Z' },
  { id: 'msg4', senderId: '2', receiverId: '3', text: '민수님 DB 마이그레이션 검토해주신 거 API 엔드포인트 정보 좀 알 수 있을까요?', timestamp: '2026-06-25T10:15:00Z' },
  { id: 'msg5', senderId: '3', receiverId: '2', text: '아 네 영희님! Postman 문서 공유해 드릴게요. 잠시만요!', timestamp: '2026-06-25T10:16:00Z' }
];

export function initializeData() {
  if (typeof window === 'undefined') {
    return { users: initialUsers, milestones: initialMilestones, tasks: initialTasks, logs: initialLogs, messages: initialMessages };
  }
  
  let users = localStorage.getItem('sa_users');
  let milestones = localStorage.getItem('sa_milestones');
  let tasks = localStorage.getItem('sa_tasks');
  let logs = localStorage.getItem('sa_logs');
  let messages = localStorage.getItem('sa_messages');

  if (!users) {
    localStorage.setItem('sa_users', JSON.stringify(initialUsers));
    users = JSON.stringify(initialUsers);
  }
  if (!milestones) {
    localStorage.setItem('sa_milestones', JSON.stringify(initialMilestones));
    milestones = JSON.stringify(initialMilestones);
  }
  if (!tasks) {
    localStorage.setItem('sa_tasks', JSON.stringify(initialTasks));
    tasks = JSON.stringify(initialTasks);
  }
  if (!logs) {
    localStorage.setItem('sa_logs', JSON.stringify(initialLogs));
    logs = JSON.stringify(initialLogs);
  }
  if (!messages) {
    localStorage.setItem('sa_messages', JSON.stringify(initialMessages));
    messages = JSON.stringify(initialMessages);
  }

  return {
    users: JSON.parse(users),
    milestones: JSON.parse(milestones),
    tasks: JSON.parse(tasks),
    logs: JSON.parse(logs),
    messages: JSON.parse(messages)
  };
}

export function saveData(data) {
  if (typeof window === 'undefined') return;
  if (data.users) localStorage.setItem('sa_users', JSON.stringify(data.users));
  if (data.milestones) localStorage.setItem('sa_milestones', JSON.stringify(data.milestones));
  if (data.tasks) localStorage.setItem('sa_tasks', JSON.stringify(data.tasks));
  if (data.logs) localStorage.setItem('sa_logs', JSON.stringify(data.logs));
  if (data.messages) localStorage.setItem('sa_messages', JSON.stringify(data.messages));
}
