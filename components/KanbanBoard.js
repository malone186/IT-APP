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
      className="w-5.5 h-5.5 rounded-full border border-gray-800/80 flex items-center justify-center text-[8.5px] font-bold text-gray-250 shrink-0 select-none font-sans"
    >
      {initial}
    </div>
  );
};

const COLUMNS = [
  { id: 'TODO', title: '할 일', color: 'border-t-blue-500' },
  { id: 'IN_PROGRESS', title: '진행 중', color: 'border-t-amber-500' },
  { id: 'IN_REVIEW', title: '검토 중', color: 'border-t-orange-500' },
  { id: 'DONE', title: '완료', color: 'border-t-emerald-500' }
];

export default function KanbanBoard({ tasks, users, milestones, onAddTask, onUpdateTask, onDeleteTask, onTaskStatusChange }) {
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [activeDropCol, setActiveDropCol] = useState(null);
  
  // 검색 및 필터 상태 추가
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterAssignee, setFilterAssignee] = useState('ALL');
  
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

  // 필터된 태스크 목록 계산
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'ALL' || task.priority === filterPriority;
    const matchesAssignee = filterAssignee === 'ALL' || task.assigneeId === filterAssignee;
    return matchesSearch && matchesPriority && matchesAssignee;
  });

  // Drag & Drop 핸들러
  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.currentTarget.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
    setDraggedTaskId(null);
    setActiveDropCol(null);
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    if (activeDropCol !== colId) {
      setActiveDropCol(colId);
    }
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (taskId) {
      onTaskStatusChange(taskId, targetStatus);
    }
    setActiveDropCol(null);
    setDraggedTaskId(null);
  };

  // 모달 제어
  const openAddModal = (status = 'TODO') => {
    setEditingTask(null);
    setFormTitle('');
    setFormDesc('');
    setFormPriority('MEDIUM');
    setFormAssignee(users[0]?.id || '');
    setFormMilestone(milestones[0]?.id || '');
    setFormStatus(status);
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDesc(task.description);
    setFormPriority(task.priority);
    setFormAssignee(task.assigneeId);
    setFormMilestone(task.milestoneId);
    setFormStatus(task.status);
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
      status: formStatus
    };

    if (editingTask) {
      onUpdateTask(editingTask.id, taskData);
    } else {
      onAddTask(taskData);
    }
    setIsModalOpen(false);
  };

  // 헬퍼: 우선순위 라벨/컬러
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-400 border border-red-900/50">High</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-900/50">Medium</span>;
      case 'LOW':
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-400 border border-blue-900/50">Low</span>;
    }
  };

  return (
    <div className="p-6 flex flex-col h-full">
      {/* 상단 액션 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>Sprint Kanban Board</span>
        </h2>
        <button
          onClick={() => openAddModal()}
          className="bg-orange-600 hover:bg-orange-700 text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors shadow-lg shadow-orange-500/20"
        >
          + 새 태스크 추가
        </button>
      </div>
      
      {/* 검색 및 필터링 제어 영역 */}
      <div className="bg-gray-950/40 border border-gray-900/60 p-4 rounded-2xl flex flex-col md:flex-row gap-3 mb-6 items-center justify-between">
        <div className="flex flex-1 w-full md:w-auto items-center space-x-2">
          <span className="text-xs text-gray-500 shrink-0 select-none">🔎 검색</span>
          <input
            type="text"
            placeholder="태스크 제목, 설명 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 max-w-md bg-gray-900 border border-gray-850/80 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500 placeholder-gray-600 transition-colors"
          />
        </div>
        
        <div className="flex w-full md:w-auto gap-3 items-center justify-end">
          {/* 우선순위 필터 */}
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] text-gray-500 font-bold uppercase select-none">Priority</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-gray-900 border border-gray-800 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-orange-500"
            >
              <option value="ALL">전체 우선순위</option>
              <option value="HIGH">High Only</option>
              <option value="MEDIUM">Medium Only</option>
              <option value="LOW">Low Only</option>
            </select>
          </div>

          {/* 담당자 필터 */}
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] text-gray-500 font-bold uppercase select-none">Assignee</span>
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="bg-gray-900 border border-gray-800 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-orange-500"
            >
              <option value="ALL">전체 담당자</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {roleIcons[u.role] || ''} {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 보드 레이아웃 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start flex-1 min-h-[500px]">
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);
          const isOver = activeDropCol === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={() => setActiveDropCol(null)}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`glass flex flex-col rounded-2xl border-t-4 ${col.color} p-4 min-h-[450px] transition-all duration-200 ${
                isOver ? 'drag-over' : 'border-x-transparent border-b-transparent'
              }`}
            >
              {/* 컬럼 헤더 */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-gray-200">{col.title}</span>
                <span className="bg-gray-800 text-gray-400 text-xs px-2 py-0.5 rounded-full font-semibold">
                  {colTasks.length}
                </span>
              </div>

              {/* 카드 목록 */}
              <div className="space-y-3 overflow-y-auto flex-1 max-h-[500px] pr-1">
                {colTasks.map((task) => {
                  const assignee = users.find((u) => u.id === task.assigneeId);
                  const milestone = milestones.find((m) => m.id === task.milestoneId);

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => openEditModal(task)}
                      className="glass-card rounded-xl p-4 cursor-grab active:cursor-grabbing border border-gray-800/80 hover:border-orange-500/30 transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* 카드 상단 배지 */}
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-mono text-gray-500 font-bold">#{task.id}</span>
                          {getPriorityBadge(task.priority)}
                        </div>
                        {/* 카드 제목 */}
                        <h4 className="text-sm font-bold text-gray-100 mb-1 leading-snug break-words">
                          {task.title}
                        </h4>
                        {/* 카드 설명 */}
                        <p className="text-xs text-gray-400 mb-3 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      </div>

                      {/* 카드 하단 메타 */}
                      <div className="flex justify-between items-center mt-2 border-t border-gray-800/50 pt-2.5">
                        {milestone && (
                          <span className="text-[10px] bg-gray-900 border border-gray-800 text-gray-400 px-2 py-0.5 rounded max-w-[100px] truncate">
                            🎯 {milestone.title}
                          </span>
                        )}
                        {assignee && (
                          <div className="flex items-center space-x-1.5 ml-auto" title={`${assignee.name} (${assignee.role})`}>
                            {getAvatarPlaceholder(assignee.name)}
                            <span className="text-[10px] text-gray-400 font-bold flex items-center gap-0.5">
                              <span>{roleIcons[assignee.role] || ''}</span>
                              <span>{assignee.name}</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {colTasks.length === 0 && (
                  <div className="h-24 flex items-center justify-center border border-dashed border-gray-800/60 rounded-xl">
                    <span className="text-xs text-gray-500">작업 없음</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 태스크 추가/수정 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass rounded-2xl w-full max-w-md p-6 border border-gray-800 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">
              {editingTask ? '태스크 수정' : '새 태스크 추가'}
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
                    value={formMilestone}
                    onChange={(e) => setFormMilestone(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
                  >
                    {milestones.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                </div>
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
