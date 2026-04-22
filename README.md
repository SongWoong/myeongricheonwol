# 명리천월(命理天月)

수천 년 동양 지혜 + AI 해석을 결합한 사주·타로·자미두수·운세 웹앱.

## 캐릭터 / 메뉴

| 캐릭터 | 한자 | 역할 | 라우트 |
|---|---|---|---|
| 자운 | 紫雲 | 사주(자평명리) | `/saju` |
| 월령 | 月靈 | 타로 (메이저 22 + 마이너 56 = 78장) | `/tarot` |
| 성연 | 星淵 | 자미두수 | `/jami` |
| 밀서 | 密書 | 성인 전용 (미구현) | `/milseo` |

**무료 기능 (하단 탭)**:
- 🌙 꿈해몽 — 일 3회 (`/dream`)
- 💫 오늘운세 — 일 1회 (`/today`)
- 📜 토정비결 — 연 1회 (`/tojeong`)

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

프로젝트 루트에 `.env.local` 파일을 만들고 본인의 Anthropic API 키를 넣으세요:

```
ANTHROPIC_API_KEY=sk-ant-api03-...
```

API 키는 [console.anthropic.com](https://console.anthropic.com)에서 발급.

### 3. 개발 서버

```bash
npm run dev
```

`http://localhost:3000` 접속.

### 4. 운영 빌드

```bash
npm run build
npm run start
```

## 기술 스택

- **Next.js 16.2.4** (App Router, Turbopack)
- **React 19.2**
- **Tailwind CSS 4**
- **TypeScript 5**
- **@anthropic-ai/sdk 0.90** — AI 해석 (Claude Haiku 4.5 사용 중)
- **lunar-typescript** — 만세력 정밀 계산 (사주 4기둥, 음양력 변환, 절기, 대운)
- **iztro** — 자미두수 명반 계산 (12궁, 14주성, 보좌성, 4화)

## 프로젝트 구조

```
app/
├── page.tsx               # 홈 (캐릭터 그리드 + 하단 탭)
├── layout.tsx             # 루트 레이아웃
├── globals.css            # 글로벌 스타일 (스크롤바 등)
├── saju/page.tsx          # 자운 사주 — 챕터 메뉴
├── jami/page.tsx          # 성연 자미두수 — 챕터 메뉴
├── tarot/page.tsx         # 월령 타로 — 셔플/뽑기/뒤집기
├── today/page.tsx         # 오늘운세
├── dream/page.tsx         # 꿈해몽
├── tojeong/page.tsx       # 토정비결
├── lib/
│   ├── saju.ts            # 사주 8자 계산 (lunar-typescript)
│   ├── jami.ts            # 자미두수 명반 계산 (iztro)
│   ├── saju-chapters.ts   # 사주 9개 챕터 정의
│   ├── jami-chapters.ts   # 자미두수 10개 챕터 정의
│   ├── tarot.ts           # 78장 타로 덱 + 셔플
│   ├── voices.ts          # 캐릭터별 말투 + 가독성/구체성 원칙
│   ├── sanitize.ts        # AI 응답 마크다운 제거
│   └── limits.ts          # 무료 사용 제한 (localStorage)
└── api/
    ├── saju/route.ts      # 사주 챕터 풀이
    ├── jami/route.ts      # 자미두수 챕터 풀이
    ├── tarot/route.ts     # 타로 풀이
    ├── today/route.ts     # 오늘운세
    ├── dream/route.ts     # 꿈해몽
    └── tojeong/route.ts   # 토정비결

public/
├── char-jawun.png ~ char-milseo.png  # 캐릭터 이미지
├── bg.png                  # 홈 히어로 배경
└── tarot/                  # 타로 카드 78장 + 카드백
    ├── back.jpg
    ├── major/00-fool.jpg ~ 21-world.jpg
    └── minor/wands-01.jpg ~ pents-14.jpg
```

## 핵심 설계

### 만세력 + AI 분리
- **계산은 코드로 (정확도)**: 사주 4기둥, 12궁, 십신, 대운 모두 라이브러리로 정밀 산출
- **해석만 AI로**: AI는 추측하지 않고 정확한 명식을 받아 해석만 작성

### 무료 / 유료 구조
- **무료**: 캐릭터별 1개 가벼운 챕터 (예: 사주의 "올해 운세 간단" 연 1회)
- **유료**: 종합·심층 챕터 (1,900~2,900원/챕터, 결제 미연동)
- **개발 모드(`NODE_ENV=development`)**: 모든 유료 챕터 자동 무료, [DEV] 재생성 버튼 노출

### 캐릭터 말투 ([app/lib/voices.ts](app/lib/voices.ts))
- 자운(그대), 월령(당신), 성연(그대) — 각자 호칭/어휘
- 공통 가독성 원칙: 어려운 한자어는 괄호로 즉시 풀이, 옛 말투 금지, 친근한 존댓말
- 공통 구체성 원칙: 일반론 금지, 시기·인물·행동 모두 구체적으로

### 무료 제한 ([app/lib/limits.ts](app/lib/limits.ts))
- localStorage 기반 (브라우저별/사람별 별개)
- daily / yearly / lifetime 3종
- 우회 가능 (시크릿 모드 등) — 인증 시스템 도입 시 서버 카운트로 강화

## 개발 팁

### Claude Code로 작업 시
- `AGENTS.md` 가 자동 로드됨 (Next.js 16 변경점 주의)
- 새 풀이 기능 추가 시: `app/lib/voices.ts` 의 캐릭터 정의 + `*-chapters.ts` 패턴 따르기
- AI 응답 max_tokens 부족 시 잘림 → 늘리고 프롬프트 간결화

### dev 서버 재시작
- 환경변수 변경 시 반드시 재시작 (`Ctrl+C` 후 `npm run dev`)
- `next.config.ts` 변경은 자동 재시작
- 캐시 문제 시 `.next/` 폴더 삭제 후 재시작

### 외부 공유 (cloudflare 터널)
```bash
npx cloudflared tunnel --url http://localhost:3000
```
발급된 도메인을 [next.config.ts](next.config.ts)의 `allowedDevOrigins`에 추가해야 동작.

## 라이선스 / 면책

- AI 기반 해석은 **참고/엔터테인먼트 용도**입니다.
- 사주·자미두수 명식 자체는 정통 만세력 라이브러리로 정밀 계산.
- 타로 카드 이미지는 사용자가 제공한 자체 자산.
