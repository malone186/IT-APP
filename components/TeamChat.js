import React, { useState, useRef, useEffect } from 'react';

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

export default function TeamChat({ users, messages, currentUserId, onSendMessage }) {
  const [activeRoomId, setActiveRoomId] = useState('general'); // 'general' or 'userId'
  const [inputMsg, setInputMsg] = useState('');
  
  const chatBottomRef = useRef(null);

  // 채팅방 변경 시 및 메시지 발송 시 자동 스크롤
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeRoomId, messages]);

  const currentUser = users.find(u => u.id === currentUserId);
  const otherUsers = users.filter(u => u.id !== currentUserId);

  // 현재 활성화된 방의 메시지 필터링
  const activeMessages = messages.filter(msg => {
    if (activeRoomId === 'general') {
      return msg.receiverId === 'general';
    } else {
      // 1:1 DM 필터링 (보낸사람이 나이고 받은사람이 상대방이거나, 보낸사람이 상대방이고 받은사람이 나인 경우)
      return (
        (msg.senderId === currentUserId && msg.receiverId === activeRoomId) ||
        (msg.senderId === activeRoomId && msg.receiverId === currentUserId)
      );
    }
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    onSendMessage({
      senderId: currentUserId,
      receiverId: activeRoomId, // 'general' or 'userId'
      text: inputMsg
    });

    setInputMsg('');
  };

  const getRoomTitle = () => {
    if (activeRoomId === 'general') {
      return '# 팀 전체 단체방';
    }
    const targetUser = users.find(u => u.id === activeRoomId);
    return targetUser ? `💬 ${roleIcons[targetUser.role] || ''} ${targetUser.name} (${targetUser.role})님과의 DM` : '대화방';
  };

  return (
    <div className="flex h-[550px] overflow-hidden rounded-3xl">
      {/* 1. 좌측 사이드바: 채널 및 DM 목록 */}
      <div className="w-56 bg-gray-950/40 border-r border-gray-900 flex flex-col p-4 shrink-0">
        
        {/* 단체 채널 */}
        <div className="mb-6">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2 px-1">Channels</span>
          <button
            onClick={() => setActiveRoomId('general')}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${
              activeRoomId === 'general'
                ? 'bg-orange-600/10 text-orange-400 border border-orange-600/20'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/20 border border-transparent'
            }`}
          >
            <span># 팀 전체 단체방</span>
          </button>
        </div>

        {/* 1:1 대화 상대 (DM) */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-2 px-1">Direct Messages</span>
          <div className="space-y-1.5">
            {otherUsers.map(user => (
              <button
                key={user.id}
                onClick={() => setActiveRoomId(user.id)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                  activeRoomId === user.id
                    ? 'bg-orange-600/10 text-orange-400 border border-orange-600/20 font-bold'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/20 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <div className="relative shrink-0">
                    {getAvatarPlaceholder(user.name)}
                    <span className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full border border-gray-950 ${user.online ? 'bg-emerald-500' : 'bg-gray-600'}`} />
                  </div>
                  <span className="truncate flex items-center gap-0.5">
                    <span>{roleIcons[user.role] || ''}</span>
                    <span>{user.name} ({user.role})</span>
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* 2. 우측 메인: 대화창 */}
      <div className="flex-1 flex flex-col bg-gray-950/10">
        {/* 상단 룸 타이틀 */}
        <div className="px-6 py-4 border-b border-gray-900 bg-gray-950/20 flex justify-between items-center shrink-0">
          <span className="text-xs font-bold text-gray-200">{getRoomTitle()}</span>
          <span className="text-[9px] text-gray-500 font-mono">Logged in as {currentUser?.name}</span>
        </div>

        {/* 메시지 출력 영역 */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {activeMessages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-gray-500 italic select-none">
              대화 내역이 없습니다. 첫 메시지를 보내보세요!
            </div>
          ) : (
            activeMessages.map(msg => {
              const isMe = msg.senderId === currentUserId;
              const sender = users.find(u => u.id === msg.senderId);

              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-start space-x-2`}
                >
                  {/* 상대방 메세지 수신 시 이니셜 아바타 출력 */}
                  {!isMe && sender && (
                    <div className="mt-1">
                      {getAvatarPlaceholder(sender.name)}
                    </div>
                  )}

                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                    {/* 발신자명 표시 */}
                    {!isMe && sender && (
                      <span className="text-[10px] text-gray-550 font-bold mb-1 ml-1 flex items-center gap-0.5">
                        <span>{roleIcons[sender.role] || ''}</span>
                        <span>{sender.name} ({sender.role})</span>
                      </span>
                    )}

                    {/* 대화풍선 */}
                    <div
                      className={`px-3 py-2 rounded-2xl text-xs leading-relaxed break-all ${
                        isMe
                          ? 'bg-orange-600 text-white rounded-tr-xl rounded-l-xl rounded-br-none shadow-md shadow-orange-500/5'
                          : 'bg-gray-900 text-gray-200 rounded-tl-none rounded-r-xl rounded-bl-xl border border-gray-850'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>

                  {/* 타임스탬프 */}
                  <span className="text-[8px] text-gray-650 font-mono mb-0.5 shrink-0 select-none">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* 하단 입력 폼 */}
        <form onSubmit={handleSend} className="p-4 border-t border-gray-900 bg-gray-950/20 flex gap-2 shrink-0">
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder="대화방에 메시지를 입력해보세요..."
            className="flex-1 bg-gray-900 border border-gray-850 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500 placeholder-gray-600 transition-colors"
          />
          <button
            type="submit"
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors shrink-0"
          >
            보내기
          </button>
        </form>
      </div>
    </div>
  );
}
