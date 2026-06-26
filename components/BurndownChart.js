import React from 'react';

export default function BurndownChart({ milestone, tasks }) {
  if (!milestone) {
    return <div className="text-center text-xs text-gray-500 py-8">선택된 마일스톤이 없습니다.</div>;
  }

  const mTasks = tasks.filter(t => t.milestoneId === milestone.id);
  const totalMTasks = mTasks.length;

  // 1. 날짜 범위 배열 생성 (startDate ~ endDate)
  const start = new Date(milestone.startDate);
  const end = new Date(milestone.endDate);
  
  // 날짜 차이 계산
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

  const dateList = [];
  for (let i = 0; i <= diffDays; i++) {
    const nextDate = new Date(start);
    nextDate.setDate(start.getDate() + i);
    dateList.push(nextDate.toISOString().split('T')[0]);
  }

  // 오늘 날짜 기준 구하기 (실제 선은 오늘까지만 그림)
  const todayStr = new Date().toISOString().split('T')[0];

  // 2. 이상적 및 실제 번다운 데이터 포인트 계산
  // 이상적 선: 첫날은 totalMTasks, 마지막날은 0
  const idealPoints = dateList.map((_, index) => {
    const val = totalMTasks - (totalMTasks / diffDays) * index;
    return Math.max(0, parseFloat(val.toFixed(2)));
  });

  // 실제 선: 각 일자별 완료되지 않고 남은 태스크 수
  const actualPoints = dateList.map(date => {
    // 이 날짜나 그 이전에 완료된 태스크 수 계산
    const completedCount = mTasks.filter(t => {
      if (t.status !== 'DONE' || !t.completedAt) return false;
      return t.completedAt <= date;
    }).length;

    return totalMTasks - completedCount;
  });

  // 3. SVG 차트 크기 정의
  const width = 600;
  const height = 220;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // 좌표 변환 헬퍼
  const getX = (index) => paddingLeft + (index / diffDays) * chartWidth;
  const getY = (val) => {
    if (totalMTasks === 0) return paddingTop + chartHeight;
    return paddingTop + (1 - val / totalMTasks) * chartHeight;
  };

  // SVG 포인트 스트링 생성
  const idealPathPoints = idealPoints.map((val, idx) => `${getX(idx)},${getY(val)}`).join(' ');
  
  // 실제선 포인트 스트링 생성 (오늘 기준 미래는 그리지 않음)
  const todayIndex = dateList.indexOf(todayStr);
  const actualDrawLimit = todayIndex !== -1 ? todayIndex : dateList.length - 1;
  const actualPathPoints = actualPoints
    .slice(0, actualDrawLimit + 1)
    .map((val, idx) => `${getX(idx)},${getY(val)}`)
    .join(' ');

  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-bold text-gray-400">📉 스프린트 번다운 차트 ({milestone.title})</span>
        <div className="flex items-center space-x-3 text-[10px]">
          <div className="flex items-center space-x-1">
            <div className="w-2.5 h-0.5 border-t border-dashed border-gray-550" />
            <span className="text-gray-400">권장 진척도 (Ideal)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2.5 h-0.5 bg-orange-500" />
            <span className="text-orange-400 font-bold">실제 잔여 작업 (Actual)</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-950/60 p-4 rounded-xl border border-gray-900 flex justify-center items-center overflow-x-auto">
        <svg width={width} height={height} className="overflow-visible">
          {/* 가로 그리드선 및 Y축 라벨 */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const val = Math.round(totalMTasks * (1 - ratio));
            const y = paddingTop + ratio * chartHeight;
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 4}
                  fill="rgba(255, 255, 255, 0.4)"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* X축 날짜 라벨 (첫날, 중간날, 마지막날만 심플하게 표시) */}
          {dateList.length > 0 && (
            <>
              {/* 첫날 */}
              <text
                x={getX(0)}
                y={height - 10}
                fill="rgba(255,255,255,0.4)"
                fontSize="9"
                textAnchor="middle"
              >
                {dateList[0].slice(5)}
              </text>
              {/* 중간날 */}
              {diffDays > 2 && (
                <text
                  x={getX(Math.floor(diffDays / 2))}
                  y={height - 10}
                  fill="rgba(255,255,255,0.4)"
                  fontSize="9"
                  textAnchor="middle"
                >
                  {dateList[Math.floor(diffDays / 2)].slice(5)}
                </text>
              )}
              {/* 마지막날 */}
              <text
                x={getX(diffDays)}
                y={height - 10}
                fill="rgba(255,255,255,0.4)"
                fontSize="9"
                textAnchor="middle"
              >
                {dateList[diffDays].slice(5)}
              </text>
            </>
          )}

          {/* 이상적 번다운선 (점선) */}
          {totalMTasks > 0 && (
            <polyline
              fill="none"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="2"
              strokeDasharray="4 4"
              points={idealPathPoints}
            />
          )}

          {/* 실제 번다운선 (Neon Orange 실선) */}
          {totalMTasks > 0 && actualPathPoints && (
            <polyline
              fill="none"
              stroke="var(--neon-orange)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={actualPathPoints}
              className="drop-shadow-[0_0_4px_rgba(249,115,22,0.4)]"
            />
          )}

          {/* 실제 포인트 마커 (원) */}
          {totalMTasks > 0 && actualPoints.slice(0, actualDrawLimit + 1).map((val, idx) => (
            <circle
              key={idx}
              cx={getX(idx)}
              cy={getY(val)}
              r="4"
              fill="var(--neon-orange)"
              stroke="#0B0F19"
              strokeWidth="1.5"
            />
          ))}

          {/* 태스크가 없는 경우 경고 메시지 */}
          {totalMTasks === 0 && (
            <text
              x={width / 2}
              y={height / 2}
              fill="rgba(255,255,255,0.3)"
              fontSize="12"
              textAnchor="middle"
            >
              이 마일스톤에 등록된 태스크가 없습니다.
            </text>
          )}
        </svg>
      </div>
    </div>
  );
}
