import React, { useState, useRef, useEffect } from 'react';

export default function GitSimulator({ onTriggerGitAction }) {
  const [input, setInput] = useState('');
  const [consoleLogs, setConsoleLogs] = useState([
    { id: '1', type: 'system', text: '실시간 자동 업무 보고 시뮬레이터 (터미널) v1.0.0' },
    { id: '2', type: 'system', text: '사용법: git commit -m "완료 #<업무ID>" 또는 git commit -m "검토 #<업무ID>"' }
  ]);
  const consoleBottomRef = useRef(null);

  useEffect(() => {
    if (consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consoleLogs]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;

    // 사용자 입력 터미널에 반영
    const userLog = { id: String(Date.now()), type: 'input', text: `$ ${cmd}` };
    setConsoleLogs((prev) => [...prev, userLog]);
    setInput('');

    // Git 명령어 검증 및 파싱
    // git commit -m "..." 형태 체크
    const commitRegex = /^git\s+commit\s+-m\s+["'](.+)["']$/i;
    const match = cmd.match(commitRegex);

    if (!match) {
      setConsoleLogs((prev) => [
        ...prev,
        { id: String(Date.now() + 1), type: 'error', text: "오류: 'git commit -m \"<메시지>\"' 형식의 업무 완료 보고 명령만 테스트 가능합니다." }
      ]);
      return;
    }

    const commitMessage = match[1];
    
    // 이슈 번호 파싱 (#\d+)
    const issueMatch = commitMessage.match(/#(\d+)/);
    if (!issueMatch) {
      setConsoleLogs((prev) => [
        ...prev,
        { id: String(Date.now() + 2), type: 'warning', text: "안내: 커밋 메시지에 업무 ID(예: #3)가 감지되지 않았습니다. 코드는 업로드되었으나 업무 상태는 변경되지 않았습니다." }
      ]);
      return;
    }

    const taskId = issueMatch[1];

    // 키워드 매칭
    // close, fix, resolve => DONE
    // review, ref => IN_REVIEW
    const doneKeywords = /(close|closes|fix|fixes|resolve|resolves|완료|해결)/i;
    const reviewKeywords = /(review|reviews|ref|refs|verify|verifies|검토|확인)/i;

    let targetStatus = null;
    let actionText = '';

    if (doneKeywords.test(commitMessage)) {
      targetStatus = 'DONE';
      actionText = '완료';
    } else if (reviewKeywords.test(commitMessage)) {
      targetStatus = 'IN_REVIEW';
      actionText = '검토 중';
    }

    if (targetStatus) {
      const success = onTriggerGitAction(taskId, targetStatus, commitMessage);
      if (success) {
        setConsoleLogs((prev) => [
          ...prev,
          {
            id: String(Date.now() + 3),
            type: 'success',
            text: `[성공] 업무 #${taskId}의 상태가 자동 보고(커밋 트리거)를 통해 [${actionText}] 상태로 변경되었습니다.`
          }
        ]);
      } else {
        setConsoleLogs((prev) => [
          ...prev,
          {
            id: String(Date.now() + 3),
            type: 'error',
            text: `[실패] 업무 #${taskId}를 찾을 수 없거나 상태 변경에 실패했습니다.`
          }
        ]);
      }
    } else {
      setConsoleLogs((prev) => [
        ...prev,
        {
          id: String(Date.now() + 3),
          type: 'warning',
          text: `안내: 업무 #${taskId}가 지정되었으나, 상태 제어 단어(예: 완료, 해결, 검토, 확인)가 커밋 메시지에서 발견되지 않았습니다.`
        }
      ]);
    }
  };

  return (
    <div className="glass rounded-2xl border border-gray-800/80 overflow-hidden shadow-2xl flex flex-col h-72">
      {/* 터미널 타이틀바 */}
      <div className="bg-gray-950 px-4 py-2 flex items-center justify-between border-b border-gray-900 shrink-0">
        <div className="flex items-center space-x-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
        </div>
        <span className="text-[10px] font-mono text-gray-500 font-bold select-none">auto-work-report-simulator.sh</span>
        <div className="w-10" />
      </div>

      {/* 터미널 콘솔 로그 영역 */}
      <div className="flex-1 bg-gray-950 p-4 font-mono text-xs overflow-y-auto space-y-1.5 scrollbar-thin select-text">
        {consoleLogs.map((log) => {
          let logColor = 'text-gray-300';
          if (log.type === 'input') logColor = 'text-sky-400 font-bold';
          if (log.type === 'error') logColor = 'text-red-400';
          if (log.type === 'warning') logColor = 'text-amber-400';
          if (log.type === 'success') logColor = 'text-emerald-400 font-semibold';
          if (log.type === 'system') logColor = 'text-gray-500';

          return (
            <div key={log.id} className={`${logColor} break-all whitespace-pre-wrap`}>
              {log.text}
            </div>
          );
        })}
        <div ref={consoleBottomRef} />
      </div>

      {/* 터미널 입력 창 */}
      <form onSubmit={handleSubmit} className="bg-gray-950 border-t border-gray-900 px-4 py-2 flex items-center shrink-0">
        <span className="font-mono text-xs text-sky-400 font-bold mr-2 select-none">$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='git commit -m "완료 #3"'
          className="flex-1 bg-transparent focus:outline-none border-none text-xs font-mono text-white placeholder-gray-600"
        />
      </form>
    </div>
  );
}
