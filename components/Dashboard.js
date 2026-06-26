import React, { useState } from 'react';

const roleIcons = {
  PM: '👑',
  FE: '💻',
  BE: '⚙️',
  DEVOPS: '🚀',
  DESIGNER: '🎨'
};

const roleNames = {
  PM: '대표/기획',
  FE: '마케팅/실무',
  BE: '재무/운영',
  DEVOPS: '총무/지원',
  DESIGNER: '디자인'
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

export default function Dashboard({ tasks = [], users = [], logs = [], milestones = [] }) {
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(milestones?.[0]?.id || '');

  // 1. 전체 진척도 계산
  const safeTasks = tasks || [];
  const safeUsers = users || [];
  const totalTasks = safeTasks.length;
  const completedTasks = safeTasks.filter(t => t.status === 'DONE').length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // 2. 팀원별 리소스 로드 계산 (완료되지 않은 미완료 태스크 전체: TODO, IN_PROGRESS, IN_REVIEW)
  const resourceLoads = safeUsers.map(user => {
    const activeTasksCount = safeTasks.filter(
      t => t.assigneeId === user.id && t.status !== 'DONE'
    ).length;
    return {
      ...user,
      activeTasksCount
    };
  });

  // 최대 태스크 수 구하기 (그래프 스케일용, 최소 1)
  const maxActiveTasks = resourceLoads.length > 0 
    ? Math.max(...resourceLoads.map(r => r.activeTasksCount), 1) 
    : 1;

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
          총 {totalTasks}개 업무 중 {completedTasks}개 완료
        </p>
      </div>

      {/* CARD 2: 부서원별 업무 분담 현황 */}
      <div className="glass-card rounded-2xl p-6 md:col-span-2">
        <h3 className="text-gray-400 text-sm font-semibold mb-4">부서원별 업무 분담 현황 (미완료 업무 전체)</h3>
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
                      <span className="text-xs text-gray-400">({roleNames[member.role] || member.role})</span>
                    </span>
                    <span className="text-xs text-gray-400 font-semibold">{member.activeTasksCount}개 업무</span>
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

      {/* CARD 3: 목표 프로젝트 업무 요약판 */}
      <div className="glass-card rounded-2xl p-6 md:col-span-3">
        <div className="flex justify-between items-center mb-5">
          <div className="flex flex-col gap-1">
            <h3 className="text-gray-200 text-sm font-bold">🎯 프로젝트 목표 업무 요약</h3>
            <span className="text-[10px] text-gray-500">목표 기간 내 등록된 할 일 현황을 분석 요약합니다.</span>
          </div>
          {milestones.length > 0 && (
            <select
              value={selectedMilestoneId}
              onChange={(e) => setSelectedMilestoneId(e.target.value)}
              className="bg-gray-900 border border-gray-800 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-orange-500 font-bold"
            >
              {milestones.map(m => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          )}
        </div>

        {selectedMilestone ? (
          (() => {
            const mTasks = tasks.filter(t => t.milestoneId === selectedMilestone.id);
            const todoCount = mTasks.filter(t => t.status === 'TODO').length;
            const progressCount = mTasks.filter(t => t.status === 'IN_PROGRESS').length;
            const reviewCount = mTasks.filter(t => t.status === 'IN_REVIEW').length;
            const doneCount = mTasks.filter(t => t.status === 'DONE').length;
            const total = mTasks.length;
            const percent = total > 0 ? Math.round((doneCount / total) * 100) : 0;

            let statusMessage = "프로젝트 목표가 새로 구성되었습니다. 업무 배정을 시작해 주세요!";
            if (percent > 0 && percent < 30) statusMessage = "목표 달성을 위한 초기 업무가 순조롭게 시작되었습니다. 화이팅!";
            else if (percent >= 30 && percent < 70) statusMessage = "목표 달성 진도가 활발히 진행 중입니다. 중간 점검을 꼼꼼히 해주세요!";
            else if (percent >= 70 && percent < 100) statusMessage = "최종 완료에 근접해 가고 있습니다. 남은 업무 마무리에 힘써주세요!";
            else if (percent === 100 && total > 0) statusMessage = "축하합니다! 이 프로젝트 목표에 속한 모든 업무를 완료 보고했습니다. 🎉";

            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* 1. 통계 수치 */}
                <div className="space-y-2 md:border-r border-gray-900 pr-4">
                  <div className="text-[11px] text-gray-405 font-bold">목표 기간: {selectedMilestone.startDate} ~ {selectedMilestone.endDate}</div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-gray-900/40 p-2.5 rounded-xl border border-gray-850 text-center">
                      <div className="text-gray-500 text-[10px] font-bold">대기 업무</div>
                      <div className="text-sm font-bold text-blue-450 mt-0.5">{todoCount}건</div>
                    </div>
                    <div className="bg-gray-900/40 p-2.5 rounded-xl border border-gray-850 text-center">
                      <div className="text-gray-500 text-[10px] font-bold">진행 중</div>
                      <div className="text-sm font-bold text-amber-450 mt-0.5">{progressCount}건</div>
                    </div>
                    <div className="bg-gray-900/40 p-2.5 rounded-xl border border-gray-850 text-center">
                      <div className="text-gray-550 text-[10px] font-bold">검토/컨펌 중</div>
                      <div className="text-sm font-bold text-orange-450 mt-0.5">{reviewCount}건</div>
                    </div>
                    <div className="bg-gray-900/40 p-2.5 rounded-xl border border-gray-850 text-center">
                      <div className="text-gray-500 text-[10px] font-bold">완료 보고</div>
                      <div className="text-sm font-bold text-emerald-450 mt-0.5">{doneCount}건</div>
                    </div>
                  </div>
                </div>

                {/* 2. 진척도 게이지 */}
                <div className="flex flex-col gap-2 md:border-r border-gray-900 px-0 md:px-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-405 font-bold">목표 업무 달성율</span>
                    <span className="text-emerald-450 font-black">{percent}% ({doneCount}/{total}건)</span>
                  </div>
                  <div className="w-full bg-gray-900 h-3 rounded-full overflow-hidden border border-gray-850/50">
                    <div
                      style={{ width: `${percent}%` }}
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                    />
                  </div>
                  <div className="text-[10px] text-gray-550">완료 보고된 업무가 쌓이면 게이지가 채워집니다.</div>
                </div>

                {/* 3. 진행 브리핑 및 권장 문구 */}
                <div className="flex flex-col justify-center bg-orange-950/5 border border-orange-500/10 p-4 rounded-2xl h-full min-h-[90px]">
                  <span className="text-[11px] font-extrabold text-orange-400 block mb-1">📢 진행 브리핑</span>
                  <p className="text-xs text-gray-300 leading-relaxed font-medium">
                    {statusMessage}
                  </p>
                </div>
              </div>
            );
          })()
        ) : (
          <div className="text-center py-8 text-xs text-gray-550 italic">등록된 프로젝트 목표가 존재하지 않습니다. 먼저 목표를 만들어주세요!</div>
        )}
      </div>

      {/* CARD 4: 실시간 활동 피드 */}
      <div className="glass-card rounded-2xl p-6 md:col-span-3 flex flex-col">
        <h3 className="text-gray-400 text-sm font-semibold mb-4">최근 활동 피드</h3>
        <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
          {logs.length === 0 ? (
            <p className="text-xs text-gray-550 text-center py-4">활동 기록이 없습니다.</p>
          ) : (
            [...logs]
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
              .map(log => (
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
