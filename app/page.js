'use client';

import React, { useState, useEffect } from 'react';
import Dashboard from '@/components/Dashboard';
import KanbanBoard from '@/components/KanbanBoard';
import Milestones from '@/components/Milestones';
import GitSimulator from '@/components/GitSimulator';
import AuthScreen from '@/components/AuthScreen';
import TeamChat from '@/components/TeamChat';
import CalendarView from '@/components/CalendarView';

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
      className="w-6 h-6 rounded-full border border-gray-850/60 flex items-center justify-center text-[9px] font-bold text-gray-200 shrink-0 select-none font-sans"
    >
      {initial}
    </div>
  );
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

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState({
    users: [],
    milestones: [],
    tasks: [],
    logs: [],
    messages: []
  });
  const [isMounted, setIsMounted] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // 빌드 상태 추가
  const [buildStatus, setBuildStatus] = useState('success');
  const [lastBuildTime, setLastBuildTime] = useState('3 minutes ago');
  const [toasts, setToasts] = useState([]);
  
  // 퀵 메모장 상태 및 로드
  const [scratchpadMemo, setScratchpadMemo] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMemo = localStorage.getItem('sa_scratchpad_memo');
      if (savedMemo) {
        setScratchpadMemo(savedMemo);
      }
    }
  }, []);

  const handleMemoChange = (e) => {
    const val = e.target.value;
    setScratchpadMemo(val);
    localStorage.setItem('sa_scratchpad_memo', val);
  };

  const showToast = (message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // 브라우저 마운트 시 API를 통해 데이터 로드
  useEffect(() => {
    const loadSystemData = async () => {
      try {
        const res = await fetch('/api/data');
        if (res.ok) {
          const loadedData = await res.json();
          setData({
            users: loadedData.users || [],
            milestones: loadedData.milestones || [],
            tasks: loadedData.tasks || [],
            logs: loadedData.logs || [],
            messages: loadedData.messages || []
          });
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setIsMounted(true);
      }
    };
    loadSystemData();

    // 로그인 세션 복구
    const storedUser = localStorage.getItem('sa_current_user');
    if (storedUser) {
      setCurrentUserId(storedUser);
    }
  }, []);

  // 디데이 계산 헬퍼
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

  // 로그인 핸들러
  const handleLogin = async (username, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) {
        return false;
      }

      const { user } = await res.json();

      // 로그인 로그 기록
      const logText = `${user.name}(${user.role})님이 로그인했습니다.`;
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: logText })
      });

      // 데이터 갱신
      const updatedRes = await fetch('/api/data');
      if (updatedRes.ok) {
        const freshData = await updatedRes.json();
        setData(freshData);
      }

      setCurrentUserId(user.id);
      localStorage.setItem('sa_current_user', user.id);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  // 회원가입 핸들러
  const handleSignUp = async (signUpData) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signUpData)
      });

      if (!res.ok) {
        return false;
      }

      const { user } = await res.json();

      // 회원가입 로그 기록
      const logText = `신규 팀원 ${user.name}(${user.role})님이 가입을 완료했습니다.`;
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: logText })
      });

      // 데이터 갱신
      const updatedRes = await fetch('/api/data');
      if (updatedRes.ok) {
        const freshData = await updatedRes.json();
        setData(freshData);
      }

      return true;
    } catch (err) {
      console.error('Signup error:', err);
      return false;
    }
  };

  // 로그아웃 핸들러
  const handleLogout = async () => {
    if (!currentUserId) return;
    
    try {
      const user = data.users.find(u => u.id === currentUserId);
      
      // 로그아웃 오프라인 전환 API 호출
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId })
      });

      // 로그아웃 로그 기록
      const logText = `${user ? user.name : '알수없음'}님이 로그아웃했습니다.`;
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: logText })
      });

      setCurrentUserId(null);
      localStorage.removeItem('sa_current_user');
      
      // 데이터 갱신
      const updatedRes = await fetch('/api/data');
      if (updatedRes.ok) {
        const freshData = await updatedRes.json();
        setData(freshData);
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // 클라이언트 렌더링 검사
  if (!isMounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0B0F19]">
        <div className="text-orange-500 font-mono text-sm animate-pulse">S.A Loading...</div>
      </div>
    );
  }

  // 로그인하지 않은 상태일 때 Auth 화면 렌더링
  if (!currentUserId) {
    return <AuthScreen users={data.users} onLogin={handleLogin} onSignUp={handleSignUp} />;
  }

  const currentUser = data.users.find(u => u.id === currentUserId);

  // 활성 스프린트 요약 정보 (첫 번째 마일스톤 기준)
  const activeMilestone = data.milestones[0];
  const activeMilestoneTasks = activeMilestone ? data.tasks.filter(t => t.milestoneId === activeMilestone.id) : [];
  const activeMilestoneCompleted = activeMilestoneTasks.filter(t => t.status === 'DONE').length;
  const activeMilestoneProgress = activeMilestoneTasks.length > 0
    ? Math.round((activeMilestoneCompleted / activeMilestoneTasks.length) * 100)
    : 0;

  // 현재 로그인한 사용자의 오늘 작업 (TODO / IN_PROGRESS)
  const myTasks = data.tasks.filter(t => t.assigneeId === currentUserId && (t.status === 'TODO' || t.status === 'IN_PROGRESS'));

  // 작업 통계 요약 집계
  const totalTasks = data.tasks.length;
  const doneTasks = data.tasks.filter(t => t.status === 'DONE').length;
  const highPriorityTasks = data.tasks.filter(t => t.priority === 'HIGH' && t.status !== 'DONE').length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayDueTasks = data.tasks.filter(t => t.dueDate === todayStr && t.status !== 'DONE').length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // 1. 태스크 추가
  const handleAddTask = async (taskData) => {
    try {
      const numericIds = data.tasks.map(t => parseInt(t.id)).filter(id => !isNaN(id));
      const newId = String(numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1);
      
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newId,
          ...taskData
        })
      });

      if (res.ok) {
        const creator = data.users.find(u => u.id === taskData.assigneeId);
        const logText = `${creator ? creator.name : '알수없음'}님이 새 태스크 "#${newId} ${taskData.title}"을 추가했습니다.`;
        
        await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: logText })
        });

        const updatedRes = await fetch('/api/data');
        if (updatedRes.ok) {
          const freshData = await updatedRes.json();
          setData(freshData);
          showToast('새 태스크가 추가되었습니다! 📋');
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        console.error('Task creation failed:', errJson);
        showToast(`태스크 추가 실패: ${errJson.error || '서버 오류'}`);
      }
    } catch (err) {
      console.error('Add task error:', err);
      showToast('태스크 추가 실패 (네트워크 에러)');
    }
  };

  // 2. 태스크 수정
  const handleUpdateTask = async (id, taskData) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          ...taskData
        })
      });

      if (res.ok) {
        const assignee = data.users.find(u => u.id === taskData.assigneeId);
        const logText = `${assignee ? assignee.name : '알수없음'}님이 태스크 "#${id} ${taskData.title}" 정보를 수정했습니다.`;
        
        await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: logText })
        });

        const updatedRes = await fetch('/api/data');
        if (updatedRes.ok) {
          const freshData = await updatedRes.json();
          setData(freshData);
          showToast('태스크 정보가 수정되었습니다! ⚙️');
        }
      }
    } catch (err) {
      console.error('Update task error:', err);
    }
  };

  // 3. 태스크 삭제
  const handleDeleteTask = async (id) => {
    try {
      const targetTask = data.tasks.find(t => t.id === id);
      const res = await fetch(`/api/tasks?id=${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        const logText = `태스크 "#${id} ${targetTask ? targetTask.title : ''}"이 삭제되었습니다.`;
        await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: logText })
        });

        const updatedRes = await fetch('/api/data');
        if (updatedRes.ok) {
          const freshData = await updatedRes.json();
          setData(freshData);
          showToast('태스크가 삭제되었습니다! 🗑️');
        }
      }
    } catch (err) {
      console.error('Delete task error:', err);
    }
  };

  // 4. 칸반 카드 드래그 이동 시 상태 전이
  const handleTaskStatusChange = async (id, newStatus) => {
    const targetTask = data.tasks.find(t => t.id === id);
    if (!targetTask || targetTask.status === newStatus) return;

    try {
      const res = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: newStatus
        })
      });

      if (res.ok) {
        const statusNames = { TODO: '할 일', IN_PROGRESS: '진행 중', IN_REVIEW: '검토 중', DONE: '완료' };
        const assignee = data.users.find(u => u.id === targetTask.assigneeId);
        const logText = `${assignee ? assignee.name : '시스템'}님이 태스크 "#${id}"의 상태를 [${statusNames[newStatus]}] 상태로 이동했습니다.`;
        
        await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: logText })
        });

        const updatedRes = await fetch('/api/data');
        if (updatedRes.ok) {
          const freshData = await updatedRes.json();
          setData(freshData);
        }
      }
    } catch (err) {
      console.error('Task status change error:', err);
    }
  };

  // 5. 마일스톤 추가
  const handleAddMilestone = async (milestoneData) => {
    try {
      const res = await fetch('/api/milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(milestoneData)
      });

      if (res.ok) {
        const logText = `새 마일스톤 "${milestoneData.title}"이 프로젝트 로드맵에 추가되었습니다.`;
        await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: logText })
        });

        const updatedRes = await fetch('/api/data');
        if (updatedRes.ok) {
          const freshData = await updatedRes.json();
          setData(freshData);
          showToast('새 마일스톤이 추가되었습니다! 🎯');
        }
      }
    } catch (err) {
      console.error('Add milestone error:', err);
    }
  };

  // 6. 마일스톤 삭제
  const handleDeleteMilestone = async (id) => {
    try {
      const targetMilestone = data.milestones.find(m => m.id === id);
      const res = await fetch(`/api/milestones?id=${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        const logText = `마일스톤 "${targetMilestone ? targetMilestone.title : ''}"이 삭제되었습니다.`;
        await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: logText })
        });

        const updatedRes = await fetch('/api/data');
        if (updatedRes.ok) {
          const freshData = await updatedRes.json();
          setData(freshData);
          showToast('마일스톤이 삭제되었습니다! 🗑️');
        }
      }
    } catch (err) {
      console.error('Delete milestone error:', err);
    }
  };

  // 7. Git 시뮬레이터 커밋 액션 핸들러
  const handleTriggerGitAction = async (taskId, targetStatus, commitMessage) => {
    const targetTask = data.tasks.find(t => t.id === taskId);
    if (!targetTask) return false;

    setBuildStatus('building');
    setTimeout(() => {
      setBuildStatus('success');
      setLastBuildTime('Just now');
    }, 2500);

    try {
      const res = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: taskId,
          status: targetStatus
        })
      });

      if (res.ok) {
        const statusNames = { TODO: '할 일', IN_PROGRESS: '진행 중', IN_REVIEW: '검토 중', DONE: '완료' };
        const assignee = data.users.find(u => u.id === targetTask.assigneeId);
        const assigneeName = assignee ? `${assignee.name}(${assignee.role})` : '팀원';
        const logText = `[Git Webhook Success] 🚀 ${assigneeName}님이 커밋 "${commitMessage}"을 푸시하여 태스크 #${taskId}을 [${statusNames[targetStatus]}] 상태로 전이하고 빌드 컴파일을 성공적으로 완료했습니다.`;
        
        await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: logText })
        });

        showToast('Git 커밋 웹훅 및 자동 빌드가 완료되었습니다! 🚀');

        const updatedRes = await fetch('/api/data');
        if (updatedRes.ok) {
          const freshData = await updatedRes.json();
          setData(freshData);
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error('Git action error:', err);
      return false;
    }
  };

  // 8. 메시지 전송 핸들러
  const handleSendMessage = async (msgData) => {
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msgData)
      });

      if (res.ok) {
        const updatedRes = await fetch('/api/data');
        if (updatedRes.ok) {
          const freshData = await updatedRes.json();
          setData(freshData);
        }
      }
    } catch (err) {
      console.error('Send message error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-200 font-sans flex flex-col md:flex-row animate-fade-in-up">
      
      {/* 1. 좌측 사이드바 (Sidebar) */}
      <aside className="w-full md:w-64 glass border-b md:border-b-0 md:border-r border-gray-900 shrink-0 flex flex-col justify-between p-6 gap-5 md:sticky md:top-0 md:h-screen overflow-y-auto">
        
        {/* 상단 브랜드 로고 및 빌드 상태 위젯 */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <span className="text-2xl font-black bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent tracking-wider">
                  S.A
                </span>
                <span className="text-[10px] bg-orange-950 text-orange-400 border border-orange-900/60 px-2 py-0.5 rounded-full font-extrabold select-none">
                  PRO
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-[9px] bg-gray-900 border border-gray-850 hover:border-red-500/30 text-gray-450 hover:text-red-400 font-bold px-2 py-1 rounded transition-colors"
              >
                로그아웃
              </button>
            </div>
            <span className="text-[10px] text-gray-500 font-mono">Sprint Analyzer Engine</span>
          </div>

          {/* 내 정보 프로필 카드 */}
          {currentUser && (
            <div className="bg-gradient-to-br from-gray-950/70 to-gray-900/60 border border-gray-850 p-3 rounded-2xl flex items-center gap-3 shadow-md">
              {getAvatarPlaceholder(currentUser.name)}
              <div className="flex-1 min-w-0 flex flex-col">
                <span className="text-xs font-bold text-gray-200 flex items-center gap-1.5 truncate">
                  <span>{currentUser.name}</span>
                  <span className="text-[11px]" title={currentUser.role}>{roleIcons[currentUser.role]}</span>
                </span>
                <span className="text-[9px] text-gray-550 mt-0.5 font-mono">{currentUser.role} Account</span>
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            </div>
          )}

          {/* 빌드/배포 상태 위젯 */}
          <div className="bg-gray-950/40 border border-gray-900/80 p-3 rounded-xl flex items-center space-x-3">
            <span className="relative flex h-2 w-2 shrink-0">
              {buildStatus === 'building' ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500 animate-pulse-amber"></span>
                </>
              ) : (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-450 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 animate-pulse-green"></span>
                </>
              )}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Deployment Status</div>
              <div className="text-xs font-bold text-gray-200 truncate">
                {buildStatus === 'building' ? 'Building...' : 'Production Ready'}
              </div>
              <div className="text-[9px] text-gray-550 mt-0.5 font-mono">Updated {lastBuildTime}</div>
            </div>
          </div>
        </div>

        {/* 네비게이션 메뉴 */}
        <nav className="flex flex-col gap-1.5 flex-1 mt-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between hover:scale-[1.02] active:scale-[0.98] ${
              activeTab === 'dashboard'
                ? 'bg-orange-600/20 text-orange-300 border border-orange-600/35 shadow-lg shadow-orange-500/5'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/40 border border-transparent'
            }`}
          >
            <span>📊 대시보드 (Dashboard)</span>
          </button>
          <button
            onClick={() => setActiveTab('kanban')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between hover:scale-[1.02] active:scale-[0.98] ${
              activeTab === 'kanban'
                ? 'bg-orange-600/20 text-orange-300 border border-orange-600/35 shadow-lg shadow-orange-500/5'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/40 border border-transparent'
            }`}
          >
            <span>📋 칸반 보드 (Kanban)</span>
          </button>
          <button
            onClick={() => setActiveTab('milestones')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between hover:scale-[1.02] active:scale-[0.98] ${
              activeTab === 'milestones'
                ? 'bg-orange-600/20 text-orange-300 border border-orange-600/35 shadow-lg shadow-orange-500/5'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/40 border border-transparent'
            }`}
          >
            <span>🎯 마일스톤 & 로드맵</span>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between hover:scale-[1.02] active:scale-[0.98] ${
              activeTab === 'chat'
                ? 'bg-orange-600/20 text-orange-300 border border-orange-600/35 shadow-lg shadow-orange-500/5'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/40 border border-transparent'
            }`}
          >
            <span>💬 메시지 (Team Chat)</span>
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between hover:scale-[1.02] active:scale-[0.98] ${
              activeTab === 'calendar'
                ? 'bg-orange-600/20 text-orange-300 border border-orange-600/35 shadow-lg shadow-orange-500/5'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/40 border border-transparent'
            }`}
          >
            <span>🗓️ 일정 캘린더 (Calendar)</span>
          </button>
        </nav>

        {/* 작업 통계 요약 위젯 */}
        <div className="bg-gray-950/40 border border-gray-900 p-4 rounded-xl flex flex-col gap-2.5">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Sprint Metrics</span>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-gray-900/60 p-2 rounded-lg border border-gray-850 flex flex-col justify-center">
              <span className="text-gray-500 font-bold">긴급(HIGH)</span>
              <span className="text-xs font-black text-red-400 mt-0.5">{highPriorityTasks}건</span>
            </div>
            <div className="bg-gray-900/60 p-2 rounded-lg border border-gray-850 flex flex-col justify-center">
              <span className="text-gray-500 font-bold">오늘 마감</span>
              <span className={`text-xs font-black mt-0.5 ${todayDueTasks > 0 ? 'text-orange-400 animate-pulse' : 'text-gray-300'}`}>{todayDueTasks}건</span>
            </div>
          </div>
          <div className="flex justify-between items-center text-[9px] text-gray-400 border-t border-gray-900 pt-2">
            <span>완료율</span>
            <span className="font-bold text-emerald-400">{completionRate}% ({doneTasks}/{totalTasks})</span>
          </div>
        </div>

        {/* 오늘의 퀵 메모장 위젯 */}
        <div className="bg-gray-950/40 border border-gray-900 p-4 rounded-xl flex flex-col gap-2">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Quick Scratchpad</span>
          <textarea
            value={scratchpadMemo}
            onChange={handleMemoChange}
            placeholder="팀 공유 메모 또는 작업 아이디어를 기입해 두세요..."
            rows={3}
            className="w-full bg-gray-900/80 border border-gray-850 rounded-lg p-2 text-[10px] text-gray-350 focus:outline-none focus:border-orange-500 placeholder-gray-700 transition-colors resize-none leading-relaxed"
          />
        </div>

        {/* 나의 오늘 작업 위젯 */}
        <div className="bg-gray-950/40 border border-gray-900 p-4 rounded-xl flex flex-col gap-2.5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">My Tasks ({myTasks.length})</span>
            <span className="text-[10px] font-bold text-orange-400 flex items-center gap-1">
              <span>{roleIcons[currentUser?.role] || ''}</span>
              <span>{currentUser?.role}</span>
            </span>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
            {myTasks.length === 0 ? (
              <div className="text-[10px] text-gray-550 italic py-1 text-center">할당된 작업이 없습니다.</div>
            ) : (
              myTasks.map(t => (
                <div
                  key={t.id}
                  onClick={() => setActiveTab('kanban')}
                  className="bg-gray-900/40 hover:bg-orange-950/20 border border-gray-850 hover:border-orange-500/20 rounded-lg p-2.5 cursor-pointer transition-colors text-[10px] flex flex-col gap-1"
                >
                  <div className="flex justify-between items-start gap-1">
                    <span className="text-gray-200 font-bold leading-tight line-clamp-1">{t.title}</span>
                    <span className={`shrink-0 px-1 py-0.2 rounded text-[8px] font-extrabold ${t.priority === 'HIGH' ? 'bg-red-950/50 text-red-400' : 'bg-gray-800 text-gray-450'}`}>
                      {t.priority}
                    </span>
                  </div>
                  <span className="text-gray-500 font-mono text-[9px]">#{t.id} {t.status}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 사이드바 사이드 위젯: 활성 스프린트 정보 */}
        {activeMilestone && (
          <div className="bg-gray-950/40 border border-gray-900 p-4 rounded-xl flex flex-col gap-2.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Active Sprint</span>
              <span className={`text-[10px] font-black font-mono px-1.5 py-0.5 rounded border ${getDDayColorClass(activeMilestone.endDate)}`}>
                {getDDay(activeMilestone.endDate)}
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-gray-300 truncate">{activeMilestone.title}</div>
              <div className="text-[9px] text-gray-550 font-mono">{activeMilestone.startDate} ~ {activeMilestone.endDate}</div>
            </div>
            <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden">
              <div
                style={{ width: `${activeMilestoneProgress}%` }}
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              />
            </div>
            <div className="text-[9px] text-gray-400 flex justify-between">
              <span>진척도</span>
              <span className="font-bold">{activeMilestoneProgress}%</span>
            </div>
          </div>
        )}

        {/* 사이드바 하단 위젯: 팀 디렉토리 */}
        <div className="border-t border-gray-900 pt-4 flex flex-col gap-2.5">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-1">Project Members</span>
          <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
            {data.users.map(u => (
              <div key={u.id} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center space-x-2">
                  <div className="relative shrink-0">
                    {getAvatarPlaceholder(u.name)}
                    <span className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full border border-gray-950 ${u.online ? 'bg-emerald-500 animate-pulse' : 'bg-gray-600'}`} />
                  </div>
                  <span className="text-gray-300 font-medium flex items-center gap-1">
                    <span className="text-[11px]" title={u.role}>{roleIcons[u.role] || ''}</span>
                    <span>{u.name}</span>
                  </span>
                </div>
                {u.id !== currentUserId && (
                  <button
                    onClick={() => {
                      setActiveTab('chat');
                    }}
                    className="text-[9px] text-gray-500 hover:text-orange-400 transition-colors font-bold px-1 py-0.5"
                  >
                    DM
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

      </aside>

      {/* 2. 우측 메인 콘텐츠 영역 */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* 상단 간이 헤더 */}
        <header className="glass shrink-0 border-b border-gray-900 px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            <h1 className="text-sm font-bold text-white uppercase tracking-wider">
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'kanban' && 'Sprint Kanban'}
              {activeTab === 'milestones' && 'Roadmap milestones'}
              {activeTab === 'chat' && 'Team Chatting'}
              {activeTab === 'calendar' && 'Sprint Calendar'}
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] text-gray-400 font-mono">Workspace: sa-team-project</span>
          </div>
        </header>

        {/* 본문 콘텐츠 스크롤 영역 */}
        <div className="flex-1 p-8 flex flex-col gap-6 max-w-6xl w-full mx-auto">
          
          {/* 상단 깃 시뮬레이터 (상시 노출) */}
          <section>
            <div className="flex items-center space-x-2 mb-2 px-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Git Webhook Integration Simulator</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <GitSimulator onTriggerGitAction={handleTriggerGitAction} />
          </section>

          {/* 메인 탭 콘텐츠 렌더링 */}
          <section className="glass rounded-3xl border border-gray-800/80 min-h-[500px] overflow-hidden">
            <div key={activeTab} className="animate-fade-in-up p-1">
              {activeTab === 'dashboard' && (
                <Dashboard tasks={data.tasks} users={data.users} logs={data.logs} milestones={data.milestones} />
              )}
              {activeTab === 'kanban' && (
                <KanbanBoard
                  tasks={data.tasks}
                  users={data.users}
                  milestones={data.milestones}
                  onAddTask={handleAddTask}
                  onUpdateTask={handleUpdateTask}
                  onDeleteTask={handleDeleteTask}
                  onTaskStatusChange={handleTaskStatusChange}
                />
              )}
              {activeTab === 'milestones' && (
                <Milestones
                  milestones={data.milestones}
                  tasks={data.tasks}
                  onAddMilestone={handleAddMilestone}
                  onDeleteMilestone={handleDeleteMilestone}
                />
              )}
              {activeTab === 'chat' && (
                <TeamChat
                  users={data.users}
                  messages={data.messages}
                  currentUserId={currentUserId}
                  onSendMessage={handleSendMessage}
                />
              )}
              {activeTab === 'calendar' && (
                <CalendarView
                  tasks={data.tasks}
                  users={data.users}
                  milestones={data.milestones}
                  onAddTask={handleAddTask}
                  onUpdateTask={handleUpdateTask}
                  onDeleteTask={handleDeleteTask}
                />
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className="pointer-events-auto bg-gray-950/90 border border-orange-500/20 shadow-xl shadow-orange-950/10 rounded-xl p-3.5 flex items-center space-x-3 animate-slide-in"
          >
            <span className="text-orange-400">🔔</span>
            <div className="flex-1 text-xs text-gray-205 font-semibold leading-normal">
              {t.message}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
