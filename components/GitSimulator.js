import React, { useState, useRef, useEffect } from 'react';

export default function GitSimulator({ onTriggerGitAction }) {
  const [input, setInput] = useState('');
  const [consoleLogs, setConsoleLogs] = useState([
    { id: '1', type: 'system', text: 'DevFlow Git Terminal v1.0.0' },
    { id: '2', type: 'system', text: 'Usage: git commit -m "close #<id>"  or  git commit -m "review #<id>"' }
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
        { id: String(Date.now() + 1), type: 'error', text: "Error: Only 'git commit -m \"<message>\"' command format is simulated." }
      ]);
      return;
    }

    const commitMessage = match[1];
    
    // 이슈 번호 파싱 (#\d+)
    const issueMatch = commitMessage.match(/#(\d+)/);
    if (!issueMatch) {
      setConsoleLogs((prev) => [
        ...prev,
        { id: String(Date.now() + 2), type: 'warning', text: "Info: No task ID (e.g. #3) detected in commit message. Code pushed but no status changed." }
      ]);
      return;
    }

    const taskId = issueMatch[1];

    // 키워드 매칭
    // close, fix, resolve => DONE
    // review, ref => IN_REVIEW
    const doneKeywords = /\b(close|closes|fix|fixes|resolve|resolves)\b/i;
    const reviewKeywords = /\b(review|reviews|ref|refs|verify|verifies)\b/i;

    let targetStatus = null;
    let actionText = '';

    if (doneKeywords.test(commitMessage)) {
      targetStatus = 'DONE';
      actionText = '완료(Done)';
    } else if (reviewKeywords.test(commitMessage)) {
      targetStatus = 'IN_REVIEW';
      actionText = '검토 중(In Review)';
    }

    if (targetStatus) {
      const success = onTriggerGitAction(taskId, targetStatus, commitMessage);
      if (success) {
        setConsoleLogs((prev) => [
          ...prev,
          {
            id: String(Date.now() + 3),
            type: 'success',
            text: `[Success] Task #${taskId} auto-transitioned to ${actionText} via commit trigger.`
          }
        ]);
      } else {
        setConsoleLogs((prev) => [
          ...prev,
          {
            id: String(Date.now() + 3),
            type: 'error',
            text: `[Fail] Task #${taskId} could not be found or state transition failed.`
          }
        ]);
      }
    } else {
      setConsoleLogs((prev) => [
        ...prev,
        {
          id: String(Date.now() + 3),
          type: 'warning',
          text: `Info: Commit message had task #${taskId} but no control keyword (e.g. close, review) was found.`
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
        <span className="text-[10px] font-mono text-gray-500 font-bold select-none">git-webhook-simulator.sh</span>
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
          placeholder='git commit -m "fix #3"'
          className="flex-1 bg-transparent focus:outline-none border-none text-xs font-mono text-white placeholder-gray-600"
        />
      </form>
    </div>
  );
}
