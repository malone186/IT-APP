import React, { useState } from 'react';
import BurndownChart from './BurndownChart';

const roleIcons = {
  PM: '👑',
  FE: '💻',
  BE: '⚙️',
  DEVOPS: '🚀',
  DESIGNER: '🎨'
};

const getAvatarPlaceholder = (name) => {
  const initial = name ? name.slice(-2) : '?';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash % 360);
  return (
    <div 
      style={{ backgroundColor: `hsl(${h}, 45%, 18%)`, borderColor: `hsl(${h}, 45%, 35%)` }} 
      className="w-8 h-8 rounded-full border border-gray-800/80 flex items-center justify-center text-[10px] font-bold text-gray-200 shrink-0 select-none font-sans"
    >
      {initial}
    </div>
  );
};

export default function Dashboard({ tasks, users, logs, milestones }) {
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(milestones[0]?.id || '');

  // 1. 전체 진척도 계산
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'DONE').length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // 2. 팀원별 리소스 로드 계산 (IN_PROGRESS 또는 IN_REVIEW 상태인 태스크)
  const resourceLoads = users.map(user => {
    const activeTasksCount = tasks.filter(
      t => t.assigneeId === user.id && (t.status === 'IN_PROGRESS' || t.status === 'IN_REVIEW')
    ).length;
    return {
      ...user,
      activeTasksCount
    };
  });

  // 최대 태스크 수 구하기 (그래프 스케일용, 최소 1)
  const maxActiveTasks = Math.max(...resourceLoads.map(r => r.activeTasksCount), 1);

  // 3. 원형 게이지를 위한 stroke 계산
  const radius = 50;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  // 4. 선택된 마일스톤 데이터
  const selectedMilestone = milestones.find(m => m.id === selectedMilestoneId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      
      {/* CARD 1: 전체 진척도 게이지 */}
      <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center">
        <h3 className="text-gray-400 text-sm font-semibold mb-4 self-start">전체 프로젝트 진척률</h3>
        <div className="relative flex items-center justify-center mb-2">
          <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
            <circle
              stroke="rgba(255,255,255,0.05)"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            <circle
              stroke="var(--neon-orange)"
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={circumference + ' ' + circumference}
              style={{ strokeDashoffset }}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              className="transition-all duration-500 ease-out"
            />
          </svg>
          <div className="absolute text-2xl font-bold text-white">{progressPercent}%</div>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          총 {totalTasks}개 작업 중 {completedTasks}개 완료
        </p>
      </div>

      {/* CARD 2: 팀원별 작업 부하 현황 */}
      <div className="glass-card rounded-2xl p-6 md:col-span-2">
        <h3 className="text-gray-400 text-sm font-semibold mb-4">팀원별 활성 작업 부하 (진행/리뷰 중)</h3>
        <div className="space-y-4">
          {resourceLoads.map(member => {
            const barWidthPercent = (member.activeTasksCount / maxActiveTasks) * 100;
            return (
              <div key={member.id} className="flex items-center space-x-4">
                {getAvatarPlaceholder(member.name)}
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-200 flex items-center gap-1">
                      <span>{roleIcons[member.role] || ''}</span>
                      <span>{member.name}</span>
                      <span className="text-xs text-gray-400">({member.role})</span>
                    </span>
                    <span className="text-xs text-gray-400 font-semibold">{member.activeTasksCount} Tasks</span>
                  </div>
                  <div className="w-full bg-gray-900 rounded-full h-2">
                    <div
                      style={{ width: `${barWidthPercent}%` }}
                      className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CARD 3: 스프린트 번다운 차트 통합 */}
      <div className="glass-card rounded-2xl p-6 md:col-span-3">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-gray-400 text-sm font-semibold">스프린트 번다운 분석</h3>
          {milestones.length > 0 && (
            <select
              value={selectedMilestoneId}
              onChange={(e) => setSelectedMilestoneId(e.target.value)}
              className="bg-gray-900 border border-gray-800 text-xs text-white rounded-lg px-2.5 py-1 focus:outline-none focus:border-orange-500"
            >
              {milestones.map(m => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          )}
        </div>
        <BurndownChart milestone={selectedMilestone} tasks={tasks} />
      </div>

      {/* CARD 4: 실시간 활동 피드 */}
      <div className="glass-card rounded-2xl p-6 md:col-span-3 flex flex-col">
        <h3 className="text-gray-400 text-sm font-semibold mb-4">최근 활동 피드</h3>
        <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
          {logs.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-4">활동 기록이 없습니다.</p>
          ) : (
            logs.slice(0).reverse().map(log => (
              <div key={log.id} className="flex items-start space-x-3 text-xs border-b border-gray-800 pb-2">
                <span className="text-orange-400 font-mono shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-gray-300">{log.text}</span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
