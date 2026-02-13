# OLWATY Landing Page

올와티(OLWATY) 서비스의 사전 런칭용 랜딩 페이지 프로젝트입니다.  
React + TypeScript + Vite 기반이며, 이메일 사전 신청 폼을 통해 Google Apps Script 웹훅으로 데이터를 전송합니다.

## 기술 스택

- React 19
- TypeScript
- Vite
- Lucide React (아이콘)
- Tailwind CSS (CDN 방식으로 `index.html`에서 로드)

## 주요 기능

- 모바일 화면 느낌의 싱글 페이지 랜딩 UI
- 문제 인식/솔루션/브랜드 메시지 섹션
- 이메일 사전 신청 폼
- Google Apps Script 웹훅 연동 (`VITE_GOOGLE_SCRIPT_URL`)

## 실행 방법

사전 요구사항: Node.js 18+

1. 의존성 설치

```bash
npm install
```

2. 환경 변수 설정 (`.env.local`)

```bash
VITE_GOOGLE_SCRIPT_URL=YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL
```

3. 개발 서버 실행

```bash
npm run dev
```

- 기본 개발 서버: `http://localhost:3000`

## 빌드 및 미리보기

프로덕션 빌드:

```bash
npm run build
```

로컬 미리보기:

```bash
npm run preview
```

## 프로젝트 구조

```text
.
├── App.tsx                   # 랜딩 페이지 메인 UI
├── components/
│   └── EmailForm.tsx         # 이메일 수집 폼 + 웹훅 전송
├── constants.tsx             # 랜딩 섹션 데이터(문구/기능)
├── types.ts                  # 타입 정의
├── index.tsx                 # React 엔트리
├── index.html                # 폰트/스타일/메타 및 루트 마크업
└── vite.config.ts            # Vite 설정(포트 3000)
```

## 환경 변수

- `VITE_GOOGLE_SCRIPT_URL`: 이메일을 전송할 Google Apps Script Web App URL

참고:
- 현재 이메일 전송은 `fetch(..., { mode: "no-cors" })`로 구현되어 있어, 브라우저에서 응답 본문/상태코드를 읽지 못합니다.
- 따라서 네트워크 요청이 예외 없이 완료되면 성공으로 간주해 UI를 완료 상태로 표시합니다.

## 배포 가이드

- 정적 호스팅(Vercel, Netlify, GitHub Pages 등)에 배포 가능
- 배포 환경에도 `VITE_GOOGLE_SCRIPT_URL` 환경 변수를 동일하게 설정해야 합니다

## 라이선스

별도 명시가 없으면 내부/프로젝트 용도로 사용합니다.
