# Product Requirements Document (PRD) - S.A (Sprint Analyzer)

**S.A (Sprint Analyzer)**는 IT 개발 팀 프로젝트의 스프린트 기획부터 데이터베이스 모니터링, 실시간 소통까지 애자일(Agile) 방식으로 관리하고 분석하는 웹 애플리케이션입니다.

---

## 1. 프로젝트 개요 (Overview)
* **서비스명**: S.A (Sprint Analyzer)
* **목적**: 개발 직무별 역할 분담, 칸반 보드 기반 태스크 추적, 실시간 채팅, Git 커밋 연동 시뮬레이션 및 데이터 시각화 기능을 탑재한 스마트 협업 플랫폼 제공.
* **타겟**: 소규모 프로젝트 팀, 학부 개발 동아리 및 인디 개발 팀.

---

## 2. 제품 요구사항 및 핵심 기능 명세 (Requirements & Features)

### [F-1] 풀스크린 웰컴 히어로 및 동적 텍스트 인증 화면
* **기능**: 사용자의 첫 진입을 돕는 풀스크린 히어로 랜딩과 부드러운 화면 전환이 결합된 보안 인증 환경을 제공합니다.
* **상세**:
  * **풀스크린 히어로 랜딩**: 작은 카드 박스를 걷어내고 모니터 전면을 넓게 채우는 와이드 히어로 레이아웃 전개 (퀵 데모 로그인창 배제).
  * **동적 초대형 타이틀**: 메인 로고(`S.A`)를 `text-8xl` 이상으로 초대형 확대하고, 흐르는 그라데이션(`.animate-text-shine`) 및 둥실둥실 뜨는 플로팅(`.animate-float`) 효과를 부여하여 시각적 몰입도 향상.
  * **입체 화면 트랜지션**: 로그인 및 회원가입 진입 시 부드러운 페이드인과 슬라이드업 효과(`.animate-fade-in-up`)가 연계되어 폼 상자가 중앙에 나타나는 3D 모션 제공.
  * **뒤로가기 유틸**: 폼 화면에서 처음 웰컴 랜딩 화면으로 복귀할 수 있는 `← 처음으로` 동선 지원.
  * **직관적인 역할 가입**: 회원가입 시 이모지 기반 그리드 아이콘(PM 👑, FE 💻, BE ⚙️ 등)을 통해 본인의 직책을 직관적으로 매핑.
  * **로그인 이후 전역 동적 트랜지션**: 로그인 성공 및 탭 전환 시 메인 컴포넌트 전체가 부드러운 페이드인업(`.animate-fade-in-up`) 모션을 거쳐 로드되도록 구성하여 화면 전반에 프리미엄 동적 피드백 제공.

### [F-2] 드래그 앤 드롭 칸반 보드 & 실시간 필터링
* **기능**: 프로젝트의 태스크 상태를 드래그로 전이시키고 대량의 카드 목록을 쉽게 필터링합니다.
* **상세**:
  * 4가지 상태 컬럼 제공: `Todo` (할 일), `In Progress` (진행 중), `In Review` (검토 중), `Done` (완료).
  * **검색 및 필터링 컨트롤러**: 칸반 상단에 키워드 검색 바, 우선순위 필터, 담당자 필터, 그리고 **마일스톤 필터**를 한데 묶어 실시간 카드를 유연하게 선별해 내는 최적화 도구 장착.
  * **마일스톤 유연성 극대화**: 태스크 생성 시 마일스톤 없이도 등록 가능하도록 "선택 안 함" 분기를 제공하고, 카드 배지 호버 시 전체 타이틀을 확인할 수 있는 마우스 툴팁(`title`) 이식.
  * **태스크 상세**: 제목, 설명, HSL 이니셜 프로필, 마일스톤 연동 및 우선순위 라벨 표시.

### [F-3] D-Day 긴급도 시각화 및 로드맵 관리
* **기능**: 마일스톤의 마감 현황을 분석하여 일정의 긴급도를 시각적으로 다르게 보여줍니다.
* **상세**:
  * **D-Day 긴급도 표시 (Urgency Indicator)**:
    * 마감 기한 초과: `Red 🔴` 점멸 효과 (`animate-pulse`)
    * 마감 임박 (3일 이하): `Amber 🟠`
    * 일정 여유 (4일 이상): `Green 🟢`
  * **로드맵**: 하위 태스크의 진척도를 자동 반영한 마일스톤 타임라인 시각화 바 제공.

### [F-4] 이름 해싱 기반 HSL 프로필 배지
* **기능**: 실물 사진 대신 팀원의 이름 정보를 바탕으로 고유한 이니셜 아바타를 동적 생성합니다.
* **상세**:
  * 팀원의 이름 끝 2글자 파싱 및 문자 아스크 코드를 해싱 연산하여 고유한 HSL 배경 색상 자동 부여.
  * 팀 전체 UI에서 깨지기 쉽고 밋밋한 일반 이미지 링크(`<img>`)를 전면 배제하고 유니크한 원형 이니셜 아바타로 시각 통일.

### [F-5] 실시간 소통 및 토스트 알림
* **기능**: 팀원 간 즉각적인 커뮤니케이션과 성공 액션에 대한 동적인 피드백을 전달합니다.
* **상세**:
  * **대칭 말풍선**: 수신자와 송신자 메시지의 말풍선 방향, 배경 테마색, 라운드 코너(꼬리 깎임)를 완전 대칭으로 디자인하여 모바일 메신저 수준의 가독성 확보.
  * **1:1 채팅 예외 피드백**: 데이터베이스 초기화 등으로 인해 나 외에 다른 팀원이 가입되지 않았을 경우, Direct Messages 영역에 "가입된 다른 팀원이 없습니다. 새 계정을 가입시켜 주세요!"라는 직관적인 안내 가이드를 출력하여 사용자 오해를 방지.
  * **우하단 실시간 토스트**: 태스크 및 마일스톤의 생성, 수정, 완료 또는 삭제 작업 성공 시 은은한 슬라이딩 키프레임 애니메이션 알림창 노출.

### [F-6] Git 워크플로우 시뮬레이터 및 활동 피드 기록
* **기능**: 깃허브 커밋 푸시를 모사하여 태스크 상태를 자동 제어하고 모든 행위를 데이터베이스에 기록합니다.
* **상세**:
  * 모의 커밋 콘솔을 통해 `closes #id` 형태로 푸시하면 관련 태스크가 즉시 `Done`으로 전이.
  * 해당 웹훅 이벤트가 발생하면 `[Git Webhook] 🚀 이우진(PM)님이 커밋 "메시지"을 푸시하여 태스크 #id를 [완료] 상태로 전이하고 빌드를 성공적으로 마쳤습니다` 형태의 정형 로그가 DB에 영구 영속화되며 실시간 피드에 출력.

### [F-7] 마감일 기반 일정 캘린더 자동 연동
* **기능**: 태스크 등록 시 지정한 마감일에 맞춰 일정을 월간 캘린더에 실시간으로 표시하고 연동합니다.
* **상세**:
  * **달력 렌더링**: 바닐라 JS Date API 기반으로 월별 날짜 그리드를 렌더링하며 이전/다음달 이동을 지원합니다.
  * **태스크 매핑**: 격자 셀 날짜와 태스크의 `dueDate`를 매핑하여 우선순위(Red/Amber/Blue) 및 완료 여부(취소선 및 반투명 처리)를 시각화합니다.
  * **양방향 모달 링크**: 캘린더 내 태스크 클릭 시 편집 모달을, 비어있는 셀 클릭 시 해당 날짜를 기본 마감일로 지정한 태스크 추가 모달을 오픈하여 칸반보드와 유기적으로 데이터를 공유합니다.

### [F-8] 사이드바 퀵 위젯 (메모장 & 작업 통계 요약)
* **기능**: 사이드바 세로 공간을 채워주며, 팀원 및 개인의 편의성과 스프린트 관리 진척을 요약해 주는 소형 위젯입니다.
* **상세**:
  * **Sprint Metrics**: 긴급 작업(HIGH) 개수, 오늘 마감 작업 개수, 그리고 완료율(%)을 수치화하여 시각적으로 표시해 주어 대시보드로 이동하지 않아도 핵심 지표 확인이 가능합니다.
  * **Quick Scratchpad**: 새로고침이나 탭 이동 시에도 내용이 보존되는 `localStorage` 연동형 메모장을 사이드바 중하단에 내장하여 빠른 아이디어 기록을 지원합니다.

---

## 3. 기술 사양 및 아키텍처 (Technical Spec)
* **프레임워크**: Next.js 16.2.9 (Turbopack), React 19.2.4
* **데이터베이스**: Neon PostgreSQL (서버리스 클라우드 DB)
* **ORM**: Prisma ORM v7.8.0 및 `@prisma/adapter-pg` 드라이버 풀 커넥터 연계
* **API 계층**: `/api/...` REST API 백엔드 라우트 연동
* **빌드/배포 안정성 조치**:
  * `@prisma/client` 모듈의 Next.js 번들링 누락을 막기 위한 `serverExternalPackages` 지정 및 의존성 설치 직후 Prisma Client를 강제 자동 조립하는 `postinstall` 빌드 체인 연결.
  * 배포 빌드 시점의 `DATABASE_URL` 환경 변수 미정의 상황에서 정적 페이지 수집 단계 크래시를 방지하는 **임시 우회 가짜 연결 풀 방어 코드** 탑재.

---

## 4. 데이터 모델 (Prisma Schema Reference)
```prisma
model User {
  id        String    @id @default(uuid())
  name      String
  role      String
  avatarUrl String
  online    Boolean   @default(false)
  username  String    @unique
  password  String
  tasks     Task[]
}

model Milestone {
  id        String   @id @default(uuid())
  title     String
  startDate String
  endDate   String
  tasks     Task[]
}

model Task {
  id           String     @id
  title        String
  description  String
  status       String     // TODO, IN_PROGRESS, IN_REVIEW, DONE
  priority     String     // HIGH, MEDIUM, LOW
  assigneeId   String
  assignee     User       @relation(fields: [assigneeId], references: [id], onDelete: Cascade)
  milestoneId  String?
  milestone    Milestone? @relation(fields: [milestoneId], references: [id], onDelete: SetNull)
  completedAt  String?
  dueDate      String?
}

model Log {
  id        String   @id @default(uuid())
  timestamp DateTime @default(now())
  text      String
}
```

---

## 5. 디자인 시스템 및 테마 규칙
* **배경색**: 어두운 네이비 블루 및 차콜 그라데이션 조합 (`#0B0F19`)
* **포인트 칼라**: Neon Orange / Amber (`#F97316` / `#F59E0B`), Deep Purple (`#8B5CF6`)
* **유틸리티**: 글래스모피즘 (`.glass`, `.glass-card`), 마이크로 인터랙션 모션 트랜지션 (`transition-all`, `hover:scale-105`), 입체 슬라이드인 페이드 효과.
