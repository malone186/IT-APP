import React, { useState } from 'react';

export default function AuthScreen({ users, onLogin, onSignUp }) {
  const [viewState, setViewState] = useState('landing'); // 'landing', 'login', 'signup'
  
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
      setViewState('login');
      
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
    setViewState('login');
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-200 flex flex-col justify-center items-center px-4 font-sans relative overflow-hidden">
      {/* 백그라운드 프리미엄 그라데이션 글로우 효과 */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-orange-650/15 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/3 w-96 h-96 rounded-full bg-purple-650/10 blur-[130px] pointer-events-none"></div>
      
      {/* key={viewState} 를 제공해 뷰 전환 시 전체 카드가 부드럽게 fadeInUp 되도록 유도 */}
      <div 
        key={viewState}
        className="glass rounded-3xl border border-gray-800 shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-fade-in-up"
      >
        {viewState === 'landing' ? (
          /* 랜딩 (웰컴) 화면 */
          <div className="p-8 flex flex-col text-center items-center">
            {/* 상단 로고 */}
            <div className="flex items-center space-x-2.5 mb-6 mt-4 select-none">
              <span className="text-4xl font-black bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent tracking-widest">
                S.A
              </span>
              <span className="text-xs bg-orange-950 text-orange-400 border border-orange-900/60 px-2.5 py-0.5 rounded-full font-black tracking-wider">
                PRO
              </span>
            </div>
            
            {/* 타이틀 및 설명 */}
            <h1 className="text-xl font-extrabold text-white tracking-tight mb-3">
              스프린트 분석 & 팀 협업 플랫폼
            </h1>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm mb-8 font-medium">
              S.A는 실시간 개발 진척도 시각화, 지능형 칸반 보드, D-Day 모니터링 및 실시간 채팅 로그를 결합하여 팀의 개발 스프린트를 과학적으로 분석하고 협업 효율성을 극대화합니다.
            </p>
            
            {/* 진입 버튼 목록 */}
            <div className="w-full space-y-3.5 mb-8">
              <button
                onClick={() => {
                  setViewState('login');
                  setErrorMsg('');
                }}
                className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-sm py-3 rounded-xl transition-all shadow-lg shadow-orange-500/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                기존 계정으로 로그인하기
              </button>
              
              <button
                onClick={() => {
                  setViewState('signup');
                  setErrorMsg('');
                }}
                className="w-full bg-gray-900/80 hover:bg-gray-800/80 text-gray-200 border border-gray-850 hover:border-gray-700 font-bold text-sm py-3 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                신규 팀원 계정 등록 (회원가입)
              </button>
            </div>
            
            {/* 퀵 데모 접속 (개발자 편의 기능) */}
            <div className="w-full pt-5 border-t border-gray-900 mt-2">
              <span className="text-[10px] text-gray-550 font-bold uppercase tracking-wider block mb-2.5">
                개발자 빠른 체험 계정
              </span>
              <button
                type="button"
                onClick={() => handleQuickLogin('woojin', '123')}
                className="w-full bg-gray-950/60 hover:bg-gray-900 border border-gray-850 hover:border-gray-800 rounded-xl p-3 text-left transition-all flex justify-between items-center group cursor-pointer"
              >
                <div className="flex flex-col">
                  <span className="text-xs text-gray-300 font-bold group-hover:text-orange-400 transition-colors">이우진 (PM)</span>
                  <span className="text-[10px] text-gray-550 font-mono mt-0.5">ID: woojin / PW: 123</span>
                </div>
                <span className="text-gray-500 group-hover:text-gray-350 text-xs transition-colors">바로 로그인 →</span>
              </button>
            </div>
          </div>
        ) : (
          /* 로그인 또는 회원가입 폼 */
          <div>
            {/* 헤더 & 뒤로가기 */}
            <div className="bg-gray-950/80 px-6 py-6 border-b border-gray-900 flex justify-between items-center">
              <button
                onClick={() => {
                  setViewState('landing');
                  setErrorMsg('');
                }}
                className="text-xs font-bold text-gray-400 hover:text-orange-400 transition-colors flex items-center gap-1 cursor-pointer"
              >
                ← 처음으로
              </button>
              
              <div className="flex items-center space-x-1.5 select-none">
                <span className="text-xl font-black bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
                  S.A
                </span>
                <span className="text-[9px] bg-orange-950 text-orange-400 border border-orange-900/50 px-1.5 py-0.2 rounded-full font-black">
                  PRO
                </span>
              </div>
            </div>

            <div className="p-8">
              <h2 className="text-lg font-bold text-white mb-6">
                {viewState === 'login' ? '로그인' : '팀원 가입 (Sign up)'}
              </h2>

              {errorMsg && (
                <div className="mb-4 bg-red-950/40 border border-red-900/50 text-red-400 text-xs px-4 py-2.5 rounded-xl font-semibold">
                  ⚠️ {errorMsg}
                </div>
              )}

              {viewState === 'login' ? (
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
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm py-2.5 rounded-lg transition-colors shadow-lg shadow-orange-500/10 mt-6 cursor-pointer"
                  >
                    로그인 완료
                  </button>
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
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm py-2.5 rounded-lg transition-colors shadow-lg shadow-orange-500/10 mt-6 cursor-pointer"
                  >
                    가입 승인 & 등록
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

