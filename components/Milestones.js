import React, { useState } from 'react';

const getDDay = (endDateStr) => {
  if (!endDateStr) return '';
  const end = new Date(endDateStr);
  const today = new Date();
  end.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diff = end - today;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'D-Day';
  return days > 0 ? `D-${days}` : `D+${Math.abs(days)}`;
};

const getDDayColorClass = (endDateStr) => {
  if (!endDateStr) return 'text-gray-400 bg-gray-900/50 border-gray-800';
  const end = new Date(endDateStr);
  const today = new Date();
  end.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diff = end - today;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return 'text-red-450 bg-red-950/50 border-red-900/40 animate-pulse';
  if (days <= 3) return 'text-amber-450 bg-amber-950/50 border-amber-900/40';
  return 'text-emerald-400 bg-emerald-950/50 border-emerald-900/40';
};

export default function Milestones({ milestones, tasks, onAddMilestone, onDeleteMilestone }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expandedMilestoneId, setExpandedMilestoneId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !startDate || !endDate) return;

    onAddMilestone({
      title,
      startDate,
      endDate
    });

    setTitle('');
    setStartDate('');
    setEndDate('');
    setIsAddOpen(false);
  };

  const toggleExpand = (id) => {
    setExpandedMilestoneId(expandedMilestoneId === id ? null : id);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">프로젝트 목표 & 로드맵</h2>
        <button
          onClick={() => setIsAddOpen(!isAddOpen)}
          className="bg-orange-600 hover:bg-orange-700 text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors"
        >
          {isAddOpen ? '닫기' : '+ 새 목표 등록'}
        </button>
      </div>

      {/* 추가 폼 */}
      {isAddOpen && (
        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 mb-6 max-w-md border border-gray-800 space-y-4">
          <h3 className="text-sm font-bold text-gray-200">신규 프로젝트 목표 등록</h3>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">목표 이름 *</label>
            <input
              type="text"
              required
              placeholder="예: 마케팅 성과 대시보드 리뉴얼"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">시작일 *</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">종료 예정일 *</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm py-2 rounded-lg transition-colors"
          >
            등록
          </button>
        </form>
      )}

      {/* 프로젝트 목표 목록 */}
      <div className="space-y-4">
        {milestones.map((m) => {
          const mTasks = tasks.filter((t) => t.milestoneId === m.id);
          const mCompleted = mTasks.filter((t) => t.status === 'DONE').length;
          const mTotal = mTasks.length;
          const progressPercent = mTotal > 0 ? Math.round((mCompleted / mTotal) * 100) : 0;
          const isExpanded = expandedMilestoneId === m.id;

          return (
            <div key={m.id} className="glass-card rounded-2xl p-6 border border-gray-800/80">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* 왼쪽: 일정 정보 */}
                <div className="flex-1 cursor-pointer" onClick={() => toggleExpand(m.id)}>
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
                    <span className="text-lg font-bold text-white hover:text-orange-400 transition-colors">
                      🎯 {m.title}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({m.startDate} ~ {m.endDate})
                    </span>
                    <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${getDDayColorClass(m.endDate)}`}>
                      {getDDay(m.endDate)}
                    </span>
                  </div>
                  {/* 진행 바 */}
                  <div className="mt-3 flex items-center space-x-3">
                    <div className="flex-1 bg-gray-900 h-2 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${progressPercent}%` }}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-300 shrink-0">{progressPercent}%</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    총 {mTotal}개 업무 중 {mCompleted}개 완료
                  </div>
                </div>

                {/* 오른쪽: 액션 버튼 */}
                <div className="flex items-center space-x-3 self-end md:self-center">
                  <button
                    onClick={() => toggleExpand(m.id)}
                    className="text-xs bg-gray-850 hover:bg-gray-800 text-gray-305 font-semibold px-3 py-1.5 rounded-lg border border-gray-850 transition-colors"
                  >
                    {isExpanded ? '업무 숨기기' : '업무 보기'}
                  </button>
                  <button
                    onClick={() => onDeleteMilestone(m.id)}
                    className="text-xs text-red-500 hover:text-red-400 px-2 py-1.5 font-semibold transition-colors"
                  >
                    삭제
                  </button>
                </div>
              </div>

              {/* 연동된 업무 목록 아코디언 */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-800/80 space-y-2">
                  <h4 className="text-xs font-bold text-gray-400 mb-2">연동된 업무 목록</h4>
                  {mTasks.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">프로젝트 목표에 할당된 업무가 없습니다.</p>
                  ) : (
                    mTasks.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between bg-gray-900/40 border border-gray-850 rounded-xl px-4 py-2 text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500 font-mono">#{t.id}</span>
                          <span className="text-gray-200 font-medium">{t.title}</span>
                        </div>
                        <div>
                          {t.status === 'DONE' && (
                            <span className="bg-emerald-950/60 border border-emerald-900/50 text-emerald-400 font-bold px-2.5 py-0.5 rounded">
                              완료
                            </span>
                          )}
                          {t.status === 'IN_REVIEW' && (
                            <span className="bg-orange-950/60 border border-orange-900/50 text-orange-400 font-bold px-2.5 py-0.5 rounded">
                              검토/컨펌 중
                            </span>
                          )}
                          {t.status === 'IN_PROGRESS' && (
                            <span className="bg-amber-950/60 border border-amber-900/50 text-amber-400 font-bold px-2.5 py-0.5 rounded">
                              진행 중
                            </span>
                          )}
                          {t.status === 'TODO' && (
                            <span className="bg-blue-950/60 border border-blue-900/50 text-blue-400 font-bold px-2.5 py-0.5 rounded">
                              대기 중
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}

        {milestones.length === 0 && (
          <div className="text-center py-12 border border-dashed border-gray-800 rounded-2xl">
            <span className="text-sm text-gray-500">등록된 프로젝트 목표가 없습니다.</span>
          </div>
        )}
      </div>
    </div>
  );
}
