import React from 'react';

// 영문 월 변환기
const getMonthAbbr = (monthIdx) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[monthIdx];
};

// 로컬 시간대 기준 날짜 파서 (9시간 UTC 타임존 오차 방지)
const parseLocalDate = (dateStr) => {
  if (!dateStr) return new Date();
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  d.setHours(0, 0, 0, 0);
  return d;
};

export default function GanttChart({ tasks = [], users = [], milestones = [] }) {
  const safeTasks = tasks || [];
  const safeMilestones = milestones || [];

  // 1. 타임라인 가로축 최소/최대 날짜 구하기
  const getTimelineBounds = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let minDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000); // 기본 7일 전
    let maxDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000); // 기본 30일 후

    const dates = [];
    safeMilestones.forEach(m => {
      if (m.startDate) dates.push(parseLocalDate(m.startDate));
      if (m.endDate) dates.push(parseLocalDate(m.endDate));
    });

    if (dates.length > 0) {
      const parsedMin = new Date(Math.min(...dates.map(d => d.getTime())));
      const parsedMax = new Date(Math.max(...dates.map(d => d.getTime())));
      
      // 전후 여백 조금 더 주기 (시각적 균형)
      parsedMin.setDate(parsedMin.getDate() - 3);
      parsedMax.setDate(parsedMax.getDate() + 5);

      minDate = parsedMin;
      maxDate = parsedMax;
    }

    minDate.setHours(0, 0, 0, 0);
    maxDate.setHours(0, 0, 0, 0);

    return { minDate, maxDate };
  };

  const { minDate, maxDate } = getTimelineBounds();
  const totalDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) || 1;

  // 2. 가로 눈금(7일 간격) 날짜 생성
  const getGridTicks = () => {
    const ticks = [];
    const current = new Date(minDate);
    while (current <= maxDate) {
      ticks.push(new Date(current));
      current.setDate(current.getDate() + 7);
    }
    return ticks;
  };

  const ticks = getGridTicks();

  // 3. 오늘선 offset 계산
  const getTodayLineOffset = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (today >= minDate && today <= maxDate) {
      const diff = today - minDate;
      return (diff / (1000 * 60 * 60 * 24) / totalDays) * 100;
    }
    return null;
  };

  const todayOffset = getTodayLineOffset();

  // 4. 마일스톤의 상태 동적 계산 (종료 기한 조건 결합)
  const getMilestoneStatus = (milestoneId) => {
    const mTasks = safeTasks.filter(t => t.milestoneId === milestoneId);
    if (mTasks.length === 0) return 'TODO'; // 예정

    const completed = mTasks.filter(t => t.status === 'DONE').length;
    if (completed === mTasks.length) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const milestone = safeMilestones.find(m => m.id === milestoneId);
      if (milestone && milestone.endDate) {
        const endDate = parseLocalDate(milestone.endDate);
        // 계획 종료일이 오늘보다 미래라면 완료(DONE)가 아닌 진행중(IN_PROGRESS) 상태 유지
        if (endDate > today) {
          return 'IN_PROGRESS';
        }
      }
      return 'DONE'; // 완료
    }
    
    // 일부 완료되었거나 진행 중인 경우, 혹은 할 일이 있는데 모두 완료는 아닌 경우
    return 'IN_PROGRESS'; // 진행중
  };

  // 5. 마일스톤 가로 바 레이아웃 계산
  const getBarLayout = (milestone) => {
    const startDate = milestone.startDate ? parseLocalDate(milestone.startDate) : new Date();
    const endDate = milestone.endDate ? parseLocalDate(milestone.endDate) : new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    let startDiff = startDate - minDate;
    if (startDiff < 0) startDiff = 0;

    let endDiff = endDate - minDate;
    if (endDiff > (maxDate - minDate)) endDiff = maxDate - minDate;

    const left = (startDiff / (1000 * 60 * 60 * 24) / totalDays) * 100;
    const width = Math.max(((endDiff - startDiff) / (1000 * 60 * 60 * 24) / totalDays) * 100, 2); // 최소 2% 너비

    return { left, width };
  };

  // 6. 상태별 색상 클래스
  const getStatusColorClass = (status) => {
    switch (status) {
      case 'DONE':
        return 'bg-emerald-500 shadow-md shadow-emerald-500/20'; // 완료 (초록)
      case 'IN_PROGRESS':
        return 'bg-blue-500 shadow-md shadow-blue-500/20'; // 진행중 (파랑)
      case 'TODO':
      default:
        return 'bg-[#6B7280] shadow-md shadow-gray-500/10'; // 예정 (회색)
    }
  };

  return (
    <div className="glass rounded-3xl border border-gray-800/80 overflow-hidden shadow-2xl p-6 flex flex-col h-auto min-h-[300px]">
      
      {/* 타이틀 영역 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 border-b border-gray-850 pb-4">
        <div className="flex items-center space-x-2.5">
          <span className="text-xl">📅</span>
          <div className="flex flex-col">
            <span className="text-sm font-extrabold text-white">Gantt Chart 타임라인</span>
            <span className="text-[10px] text-gray-550">마일스톤 및 작업 일정 현황</span>
          </div>
        </div>

        {/* 범례 */}
        <div className="flex items-center space-x-4 text-[10px] text-gray-400 font-bold select-none">
          <span className="text-gray-500">상태</span>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span>완료</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
            <span>진행중</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#6B7280]" />
            <span>예정</span>
          </div>
        </div>
      </div>

      {safeMilestones.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-xs text-gray-550 italic py-12">
          등록된 프로젝트 목표(마일스톤) 일정이 없습니다. 목표를 먼저 생성해 주세요!
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-x-auto min-w-[800px] scrollbar-thin">
          
          {/* 간트 차트 타임라인 격자 보드 */}
          <div className="relative border border-gray-900 rounded-2xl bg-gray-950/10 flex flex-col p-5">
            
            {/* 세로 격자선 및 오늘선 */}
            <div className="absolute inset-0 pointer-events-none">
              {/* 오늘 표시선 */}
              {todayOffset !== null && (
                <div 
                  style={{ left: `${todayOffset}%` }} 
                  className="absolute top-0 bottom-0 border-l-2 border-dashed border-orange-500/60 z-20"
                >
                  <span className="absolute -top-1.5 -translate-x-1/2 bg-orange-600 text-white font-mono text-[8px] px-1 py-0.2 rounded font-black shadow select-none">
                    오늘(Today)
                  </span>
                </div>
              )}
              {/* 날짜 눈금 세로선 */}
              {ticks.map((t, idx) => {
                const diff = t - minDate;
                const offset = (diff / (1000 * 60 * 60 * 24) / totalDays) * 100;
                if (offset > 0 && offset < 100) {
                  return (
                    <div 
                      key={idx}
                      style={{ left: `${offset}%` }}
                      className="absolute top-0 bottom-0 border-l border-gray-900/40"
                    />
                  );
                }
                return null;
              })}
            </div>

            {/* 마일스톤별 가로 막대 목록 */}
            <div className="space-y-4.5 z-10">
              {safeMilestones.map(m => {
                const status = getMilestoneStatus(m.id);
                const { left, width } = getBarLayout(m);

                return (
                  <div key={m.id} className="flex items-center min-h-[30px]">
                    {/* 왼쪽: 마일스톤 타이틀 */}
                    <div className="w-64 shrink-0 pr-4 flex items-center justify-between border-r border-gray-900/60">
                      <span className="text-xs font-bold text-gray-200 truncate" title={m.title}>
                        🎯 {m.title}
                      </span>
                    </div>

                    {/* 오른쪽: 가로 바 렌더링 */}
                    <div className="flex-1 relative h-6 ml-4 select-none">
                      <div
                        style={{ left: `${left}%`, width: `${width}%` }}
                        title={`${m.title} (${m.startDate} ~ ${m.endDate})`}
                        className={`absolute top-1/2 -translate-y-1/2 h-5.5 rounded-md flex items-center px-3 min-w-[20px] transition-all hover:scale-y-105 cursor-help ${getStatusColorClass(status)}`}
                      >
                        <span className="text-[9px] font-black text-white truncate max-w-full drop-shadow">
                          {m.title}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* 하단 가로축 날짜 축 라벨 */}
          <div className="relative h-12 mt-3 select-none">
            {ticks.map((t, idx) => {
              const diff = t - minDate;
              const offset = (diff / (1000 * 60 * 60 * 24) / totalDays) * 100;
              if (offset >= 0 && offset <= 100) {
                // Jun 7, May 31 2026 형태의 날짜 출력 연산
                const isFirstTick = idx === 0;
                const monthStr = getMonthAbbr(t.getMonth());
                const dayVal = t.getDate();
                const yearVal = t.getFullYear();
                
                const label = isFirstTick 
                  ? `${monthStr} ${dayVal} ${yearVal}`
                  : `${monthStr} ${dayVal}`;

                return (
                  <div
                    key={idx}
                    style={{ left: `${offset}%` }}
                    className="absolute top-1 -translate-x-1/2 flex flex-col items-center text-[9px] font-mono text-gray-500 font-bold"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-800 mb-1" />
                    <span>{label}</span>
                  </div>
                );
              }
              return null;
            })}
          </div>

        </div>
      )}

    </div>
  );
}
