import React, { useState } from 'react';

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
      className="w-5 h-5 rounded-full border border-gray-800/80 flex items-center justify-center text-[8px] font-bold text-gray-250 shrink-0 select-none font-sans"
    >
      {initial}
    </div>
  );
};

export default function CalendarView({ tasks, users, milestones, onAddTask, onUpdateTask, onDeleteTask }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
  // 폼 상태
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPriority, setFormPriority] = useState('MEDIUM');
  const [formAssignee, setFormAssignee] = useState('');
  const [formMilestone, setFormMilestone] = useState('');
  const [formStatus, setFormStatus] = useState('TODO');
  const [formDueDate, setFormDueDate] = useState('');

  // 연도/월 연산
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed (0: Jan, 11: Dec)

  // 월 전환 핸들러
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // 모달 제어
  const openAddModal = (dateStr) => {
    setEditingTask(null);
    setFormTitle('');
    setFormDesc('');
    setFormPriority('MEDIUM');
    setFormAssignee(users[0]?.id || '');
    setFormMilestone('');
    setFormStatus('TODO');
    setFormDueDate(dateStr);
    setIsModalOpen(true);
  };

  const openEditModal = (e, task) => {
    e.stopPropagation(); // 셀 클릭 이벤트 전파 방지
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDesc(task.description);
    setFormPriority(task.priority);
    setFormAssignee(task.assigneeId);
    setFormMilestone(task.milestoneId || '');
    setFormStatus(task.status);
    setFormDueDate(task.dueDate || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const taskData = {
      title: formTitle,
      description: formDesc,
      priority: formPriority,
      assigneeId: formAssignee,
      milestoneId: formMilestone,
      status: formStatus,
      dueDate: formDueDate || null
    };

    if (editingTask) {
      onUpdateTask(editingTask.id, taskData);
    } else {
      onAddTask(taskData);
    }
    setIsModalOpen(false);
  };

  // 달력 격자 일수 계산
  const firstDayOfMonth = new Date(year, month, 1);
  const firstDayWeekday = firstDayOfMonth.getDay(); // 0: Sun, 1: Mon, ..., 6: Sat
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const totalDaysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];

  // 1. 이전 달 날짜들 채우기
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    const prevDay = totalDaysInPrevMonth - i;
    const prevMonthDate = new Date(year, month - 1, prevDay);
    const yStr = prevMonthDate.getFullYear();
    const mStr = String(prevMonthDate.getMonth() + 1).padStart(2, '0');
    const dStr = String(prevMonthDate.getDate()).padStart(2, '0');
    cells.push({
      dateStr: `${yStr}-${mStr}-${dStr}`,
      day: prevDay,
      isCurrentMonth: false,
      dateObj: prevMonthDate
    });
  }

  // 2. 현재 달 날짜들 채우기
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const yStr = year;
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    cells.push({
      dateStr: `${yStr}-${mStr}-${dStr}`,
      day: d,
      isCurrentMonth: true,
      dateObj: new Date(year, month, d)
    });
  }

  // 3. 6행 7열(총 42칸)을 맞추기 위한 다음 달 날짜 채우기
  const remainingCells = 42 - cells.length;
  for (let d = 1; d <= remainingCells; d++) {
    const nextMonthDate = new Date(year, month + 1, d);
    const yStr = nextMonthDate.getFullYear();
    const mStr = String(nextMonthDate.getMonth() + 1).padStart(2, '0');
    const dStr = String(nextMonthDate.getDate()).padStart(2, '0');
    cells.push({
      dateStr: `${yStr}-${mStr}-${dStr}`,
      day: d,
      isCurrentMonth: false,
      dateObj: nextMonthDate
    });
  }

  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const todayStr = new Date().toISOString().split('T')[0];

  const getPriorityBadgeStyle = (task) => {
    if (task.status === 'DONE') {
      return 'opacity-50 bg-gray-900 border-gray-850 text-gray-500 line-through';
    }
    switch (task.priority) {
      case 'HIGH':
        return 'bg-red-950/70 border-red-900/40 text-red-400 font-bold';
      case 'MEDIUM':
        return 'bg-amber-950/70 border-amber-900/40 text-amber-400';
      case 'LOW':
      default:
        return 'bg-blue-950/70 border-blue-900/40 text-blue-400';
    }
  };

  return (
    <div className="p-6 flex flex-col h-[650px] select-none">
      
      {/* 캘린더 네비게이션 헤더 */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold text-white font-sans flex items-center gap-2">
            <span>🗓️ 일정 캘린더</span>
            <span className="text-xs bg-orange-950 text-orange-400 border border-orange-900/40 px-2 py-0.5 rounded-full select-none">
              자동 연동
            </span>
          </h2>
          <span className="text-xs text-gray-550 font-mono">Tasks Linked by Due Date</span>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            ◀
          </button>
          <button 
            onClick={handleToday}
            className="px-3 py-1 text-xs rounded-lg bg-gray-900 border border-gray-800 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors font-bold"
          >
            오늘
          </button>
          <span className="text-sm font-bold text-gray-200 min-w-[100px] text-center">
            {year}년 {month + 1}월
          </span>
          <button 
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            ▶
          </button>
        </div>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1.5 mb-3">
        {weekdays.map((w, idx) => (
          <div 
            key={w} 
            className={`text-center py-1.5 text-xs md:text-sm font-black font-mono rounded ${
              idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-gray-500'
            }`}
          >
            {w}
          </div>
        ))}
      </div>

      {/* 날짜 격자판 */}
      <div className="grid grid-cols-7 gap-1.5 flex-1 overflow-y-auto min-h-[400px]">
        {cells.map((cell, idx) => {
          const isToday = cell.dateStr === todayStr;
          const cellTasks = tasks.filter(t => t.dueDate === cell.dateStr);

          return (
            <div
              key={idx}
              onClick={() => openAddModal(cell.dateStr)}
              className={`glass rounded-xl p-3 min-h-[95px] max-h-[135px] flex flex-col justify-between border cursor-pointer transition-all hover:bg-gray-900/20 ${
                cell.isCurrentMonth ? 'border-gray-800/80 bg-gray-950/20' : 'border-gray-900/30 bg-gray-950/5 opacity-40'
              } ${isToday ? 'border-orange-500/50 bg-orange-950/5 shadow-inner shadow-orange-500/5' : ''}`}
            >
              {/* 날짜 번호 */}
              <div className="flex justify-between items-center select-none mb-1">
                <span className={`text-xs md:text-sm font-black font-mono ${
                  isToday ? 'text-orange-400 font-black scale-110' : 'text-gray-300'
                }`}>
                  {cell.day}
                </span>
                {cellTasks.length > 0 && (
                  <span className="text-[9px] md:text-[10px] bg-gray-900/90 text-gray-405 px-1.5 py-0.5 rounded font-black font-mono">
                    {cellTasks.length}건
                  </span>
                )}
              </div>

              {/* 일정 카드 목록 */}
              <div className="flex-1 space-y-1 overflow-y-auto max-h-[80px] pr-0.5 scrollbar-thin">
                {cellTasks.map(t => (
                  <div
                    key={t.id}
                    onClick={(e) => openEditModal(e, t)}
                    title={`[#${t.id}] ${t.title}`}
                    className={`px-2 py-1 rounded text-[10px] md:text-[11px] font-bold border flex items-center justify-between gap-1 transition-transform active:scale-95 ${getPriorityBadgeStyle(t)}`}
                  >
                    <span className="truncate flex-1 font-sans">{t.title}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 태스크 추가/수정 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass rounded-2xl w-full max-w-md p-6 border border-gray-850 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">
              {editingTask ? '태스크 수정 (캘린더 연동)' : '새 태스크 추가 (캘린더 연동)'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 제목 */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">태스크명 *</label>
                <input
                  type="text"
                  required
                  placeholder="작업 제목을 입력하세요"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              {/* 설명 */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">설명</label>
                <textarea
                  placeholder="작업 내용 상세를 기입하세요"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* 우선순위 */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">우선순위</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
                  >
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>

                {/* 상태 */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">상태</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
                  >
                    <option value="TODO">할 일</option>
                    <option value="IN_PROGRESS">진행 중</option>
                    <option value="IN_REVIEW">검토 중</option>
                    <option value="DONE">완료</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* 담당자 */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">담당자</label>
                  <select
                    value={formAssignee}
                    onChange={(e) => setFormAssignee(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {roleIcons[u.role] || ''} {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 마일스톤 */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">마일스톤</label>
                  <select
                    value={formMilestone || ''}
                    onChange={(e) => setFormMilestone(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
                  >
                    <option value="">연동 안 함 (선택 없음)</option>
                    {milestones.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 마감 기한 (캘린더 연동) */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">마감 기한 (일정 캘린더 연동)</label>
                <input
                  type="date"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              {/* 액션 버튼 */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-850">
                {editingTask ? (
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteTask(editingTask.id);
                      setIsModalOpen(false);
                    }}
                    className="text-xs font-semibold text-red-500 hover:text-red-400 transition-colors px-3 py-2"
                  >
                    삭제
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
                  >
                    저장
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
