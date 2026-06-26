import React, { useState } from 'react';

export default function AuthScreen({ users, onLogin, onSignUp }) {
  const [isLoginTab, setIsLoginTab] = useState(true);
  
  // 로그인 폼
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // 회원가입 폼
  const [signName, setSignName] = useState('');
  const [signUsername, setSignUsername] = useState('');
  const [signPassword, setSignPassword] = useState('');
  const [signRole, setSignRole] = useState('FE');
  
  // 에러 메시지
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!loginUsername.trim() || !loginPassword) {
      setErrorMsg('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    const success = await onLogin(loginUsername, loginPassword);
    if (!success) {
      setErrorMsg('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!signName.trim() || !signUsername.trim() || !signPassword) {
      setErrorMsg('모든 필수 항목을 입력해주세요.');
      return;
    }

    // 아이디 중복 체크
    const usernameExists = users.some(u => u.username === signUsername.trim());
    if (usernameExists) {
      setErrorMsg('이미 존재하는 아이디입니다.');
      return;
    }

    const success = await onSignUp({
      name: signName,
      username: signUsername,
      password: signPassword,
      role: signRole
    });

    if (success) {
      // 회원가입 완료 후 아이디 자동 입력 및 로그인 탭 전환
      setLoginUsername(signUsername);
      setLoginPassword(signPassword);
      setIsLoginTab(true);
      
      // 알림
      alert('회원가입이 완료되었습니다! 가입하신 정보로 로그인해주세요.');
      
      // 가입 폼 초기화
      setSignName('');
      setSignUsername('');
      setSignPassword('');
      setSignRole('FE');
    } else {
      setErrorMsg('회원가입 처리 도중 오류가 발생했습니다.');
    }
  };

  // 테스트 로그인 가이드 퀵링크 매칭
  const handleQuickLogin = (username, password) => {
    setLoginUsername(username);
    setLoginPassword(password);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-200 flex flex-col justify-center items-center px-4 font-sans">
      <div className="glass rounded-3xl border border-gray-800 shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        
        {/* 헤더 로고 영역 */}
        <div className="bg-gray-950/80 px-6 py-8 border-b border-gray-900 text-center flex flex-col items-center gap-2 select-none">
          <div className="flex items-center space-x-2">
            <span className="text-3xl font-black bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent tracking-wider">
              S.A
            </span>
            <span className="text-xs bg-orange-950 text-orange-400 border border-orange-900/60 px-2 py-0.5 rounded-full font-black">
              PRO
            </span>
          </div>
          <p className="text-xs text-gray-500 font-mono">Sprint Analyzer & Team Collaboration Platform</p>
        </div>

        {/* 탭 헤더 */}
        <div className="flex border-b border-gray-900 bg-gray-900/10">
          <button
            onClick={() => {
              setIsLoginTab(true);
              setErrorMsg('');
            }}
            className={`flex-1 py-3 text-xs font-bold transition-colors border-b-2 ${
              isLoginTab 
                ? 'border-orange-500 text-orange-400 bg-gray-900/20' 
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            로그인
          </button>
          <button
            onClick={() => {
              setIsLoginTab(false);
              setErrorMsg('');
            }}
            className={`flex-1 py-3 text-xs font-bold transition-colors border-b-2 ${
              !isLoginTab 
                ? 'border-orange-500 text-orange-400 bg-gray-900/20' 
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            팀원 가입 (Sign up)
          </button>
        </div>

        {/* 폼 본문 */}
        <div className="p-8">
          {errorMsg && (
            <div className="mb-4 bg-red-950/40 border border-red-900/50 text-red-400 text-xs px-4 py-2.5 rounded-xl font-semibold">
              ⚠️ {errorMsg}
            </div>
          )}

          {isLoginTab ? (
            /* 로그인 폼 */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">아이디</label>
                <input
                  type="text"
                  required
                  placeholder="아이디를 입력하세요"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">비밀번호</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm py-2.5 rounded-lg transition-colors shadow-lg shadow-orange-500/10 mt-6"
              >
                로그인 완료
              </button>

              {/* 퀵 데모 테스트 가이드 */}
              <div className="pt-4 border-t border-gray-900 mt-6">
                <span className="text-[10px] text-gray-550 font-bold uppercase tracking-wider block mb-2">개발자 퀵 접속 계정</span>
                <div className="grid grid-cols-1">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('woojin', '123')}
                    className="bg-gray-950/40 hover:bg-gray-900 border border-gray-850 hover:border-gray-800 rounded px-2.5 py-1.5 text-[10px] text-left transition-colors flex flex-col items-center"
                  >
                    <span className="text-gray-300 font-semibold">이우진 (PM)</span>
                    <span className="text-gray-500">ID: woojin / PW: 123</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* 회원가입 폼 */
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">이름 *</label>
                <input
                  type="text"
                  required
                  placeholder="홍길동"
                  value={signName}
                  onChange={(e) => setSignName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">사용할 아이디 *</label>
                <input
                  type="text"
                  required
                  placeholder="아이디를 입력하세요"
                  value={signUsername}
                  onChange={(e) => setSignUsername(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">비밀번호 *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={signPassword}
                  onChange={(e) => setSignPassword(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2">개발 역할군 (Role) *</label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { val: 'PM', label: 'PM', icon: '👑', color: 'border-amber-500 text-amber-400 bg-amber-500/10' },
                    { val: 'FE', label: 'FE', icon: '💻', color: 'border-sky-500 text-sky-400 bg-sky-500/10' },
                    { val: 'BE', label: 'BE', icon: '⚙️', color: 'border-emerald-500 text-emerald-400 bg-emerald-500/10' },
                    { val: 'DEVOPS', label: 'DevOps', icon: '🚀', color: 'border-purple-500 text-purple-400 bg-purple-500/10' },
                    { val: 'DESIGNER', label: 'Design', icon: '🎨', color: 'border-pink-500 text-pink-400 bg-pink-500/10' }
                  ].map((roleItem) => (
                    <button
                      key={roleItem.val}
                      type="button"
                      onClick={() => setSignRole(roleItem.val)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        signRole === roleItem.val
                          ? `${roleItem.color} border-2 scale-105 shadow-lg shadow-orange-500/5`
                          : 'border-gray-800 text-gray-400 hover:text-gray-200 hover:bg-gray-900/40'
                      }`}
                    >
                      <span className="text-lg mb-1">{roleItem.icon}</span>
                      <span className="text-[9px] font-bold leading-none">{roleItem.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm py-2.5 rounded-lg transition-colors shadow-lg shadow-orange-500/10 mt-6"
              >
                가입 승인 & 등록
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
