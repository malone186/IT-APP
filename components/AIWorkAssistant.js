import React, { useState } from 'react';

const roleNames = {
  PM: '대표/기획',
  FE: '마케팅/실무',
  BE: '재무/운영',
  DEVOPS: '총무/지원',
  DESIGNER: '디자인'
};

export default function AIWorkAssistant({ tasks = [], users = [], milestones = [] }) {
  const [tipIndex, setTipIndex] = useState(0);

  // 1. 현재 데이터 기반 분석
  const safeTasks = tasks || [];
  const safeUsers = users || [];
  const safeMilestones = milestones || [];

  // 미완료 업무 필터
  const activeTasks = safeTasks.filter(t => t.status !== 'DONE');
  const completedTasks = safeTasks.filter(t => t.status === 'DONE');

  // MVP 선정 (완료 업무가 가장 많은 직원)
  const userCompletionCounts = safeUsers.map(u => {
    const doneCount = completedTasks.filter(t => t.assigneeId === u.id).length;
    return { name: u.name, role: u.role, count: doneCount };
  });
  const maxCompleted = userCompletionCounts.length > 0 ? Math.max(...userCompletionCounts.map(u => u.count)) : 0;
  const mvps = maxCompleted > 0 ? userCompletionCounts.filter(u => u.count === maxCompleted) : [];

  // 긴급 업무 편중 진단
  const userHighPriorityCounts = safeUsers.map(u => {
    const highCount = activeTasks.filter(t => t.assigneeId === u.id && t.priority === 'HIGH').length;
    return { name: u.name, role: u.role, count: highCount };
  });
  const overloadedUser = userHighPriorityCounts.find(u => u.count >= 2); // 2개 이상의 미완료 긴급 업무를 가진 직원

  // 프로젝트 기한 임박 체크
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const urgentMilestones = safeMilestones.filter(m => {
    if (!m.endDate) return false;
    const end = new Date(m.endDate);
    end.setHours(0, 0, 0, 0);
    const diff = end - today;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    // 기한이 3일 이하로 남았고, 해당 프로젝트 목표에 연결된 완료되지 않은 업무가 있는 경우
    const incompleteTasksCount = activeTasks.filter(t => t.milestoneId === m.id).length;
    return days >= 0 && days <= 3 && incompleteTasksCount > 0;
  });

  // 2. 비서의 기본 조언 조각들 (tipIndex로 순회)
  const getAIAdviceList = () => {
    const list = [];

    // 진단 1: MVP 축하
    if (mvps.length > 0) {
      const mvpNames = mvps.map(m => `${m.name}(${roleNames[m.role] || m.role})`).join(', ');
      list.push({
        title: '🏆 이달의 업무 달인 MVP',
        text: `현재 완료 보고를 가장 많이 마친 직원은 ${mvpNames}님입니다! (완료 업무 ${maxCompleted}건) 정말 수고하셨습니다. 따뜻한 격려 한마디 건네보세요!`
      });
    }

    // 진단 2: 업무 편중 경고
    if (overloadedUser) {
      list.push({
        title: '⚠️ 업무 쏠림 경보',
        text: `${overloadedUser.name}(${roleNames[overloadedUser.role] || overloadedUser.role})님에게 긴급 업무가 ${overloadedUser.count}건 집중되어 있어 과부하 우려가 있습니다. 동료분들과 업무를 나누어 부담을 덜어주세요.`
      });
    }

    // 진단 3: 마감 임박 프로젝트 경고
    if (urgentMilestones.length > 0) {
      const titles = urgentMilestones.map(m => m.title).join(', ');
      list.push({
        title: '⏰ 목표 프로젝트 마감 임박!',
        text: `[${titles}] 프로젝트 목표의 남은 마감 기한이 3일 이하입니다. 아직 처리되지 않은 업무가 있으니 우선적으로 완료 보고를 마쳐주세요!`
      });
    }

    // 기본 조언 1: 대기 업무 방치 여부
    const todoTasks = activeTasks.filter(t => t.status === 'TODO');
    if (todoTasks.length > 3) {
      list.push({
        title: '📋 대기 중인 업무 관리',
        text: `현재 대기 업무 컬럼에 쌓여있는 일이 ${todoTasks.length}건 있습니다. 우선도가 높은 일부터 담당 직원이 지정되었는지 살피고 업무 보드에서 진행 중으로 변경해 주세요.`
      });
    }

    // 기본 조언 2: 검토/컨펌 대기 업무
    const reviewTasks = activeTasks.filter(t => t.status === 'IN_REVIEW');
    if (reviewTasks.length > 0) {
      list.push({
        title: '🔍 검토/컨펌 요청 대기',
        text: `검토/컨펌 대기 상태로 머물러 있는 업무가 ${reviewTasks.length}건 있습니다. 대표/기획 직원은 현황판에서 컨펌 후 완료 보고 상태로 옮겨주세요.`
      });
    }

    // 기본 조언 3: 업무 균등 배분 팁
    list.push({
      title: '💡 협업 시너지 가이드',
      text: '모든 직원이 진행 상황을 투명하게 현황판에 올릴 때, 팀의 일정이 과학적이고 원활하게 관리됩니다. 사소한 진행 내용이라도 업무에 주기적으로 기록하는 습관을 들여보세요!'
    });

    return list;
  };

  const adviceList = getAIAdviceList();

  const handleNextAdvice = () => {
    setTipIndex((prev) => (prev + 1) % adviceList.length);
  };

  const currentAdvice = adviceList[tipIndex] || {
    title: '🤖 AI 업무 분석 중',
    text: '현재 부서 내에 등록된 업무 및 프로젝트 정보가 부족해 분석 중입니다. 신규 업무나 일정을 등록하시면 유용한 통찰 보고서가 작성됩니다.'
  };

  return (
    <div className="glass rounded-2xl border border-gray-800/80 overflow-hidden shadow-2xl flex flex-col p-6 bg-gradient-to-r from-purple-950/20 via-gray-900/10 to-orange-950/20 min-h-[130px] justify-center">
      <div className="flex items-center justify-between mb-4 border-b border-gray-850 pb-3 shrink-0">
        <div className="flex items-center space-x-2.5">
          <span className="text-xl">🤖</span>
          <div className="flex flex-col">
            <span className="text-sm font-extrabold text-white">AI 업무 비서 & 요약 분석기</span>
            <span className="text-[10px] text-gray-550">실시간 부서 데이터를 진단해 조언을 제안합니다.</span>
          </div>
        </div>
        {adviceList.length > 1 && (
          <button
            onClick={handleNextAdvice}
            className="text-[10px] bg-purple-900/40 hover:bg-purple-800/50 text-purple-300 border border-purple-800/40 px-3 py-1.5 rounded-lg font-bold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            💡 다른 분석 조언 보기
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center py-1">
        <div className="flex items-start space-x-3">
          <span className="text-lg shrink-0 mt-0.5 select-none">💡</span>
          <div className="space-y-1">
            <h4 className="text-xs font-black text-orange-400 font-sans tracking-wide">
              {currentAdvice.title}
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed font-medium">
              {currentAdvice.text}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
