<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 명리천월 — 프로젝트 컨텍스트 (Claude Code 핸드오프)

## 한눈에
- **무엇**: 사주·타로·자미두수·운세를 AI 해석으로 풀어주는 모바일 앱 (Next.js 16 + Anthropic Haiku 4.5)
- **컨셉**: 캐릭터 4명 (자운 紫雲 사주 / 월령 月靈 타로 / 성연 星淵 자미두수 / 밀서 密書 성인) + 무료 메뉴 3종 (꿈해몽 / 오늘운세 / 토정비결)
- **차별점**: AI가 사주를 "추측"하지 않음 — `lunar-typescript`로 만세력 정밀 계산, `iztro`로 자미두수 명반 계산. AI는 해석만 작성

## 핵심 라이브러리
- `lunar-typescript@1.8.x` — 사주 8자, 12운성, 공망, 대운, 음양력 변환 (입춘 경계 정확 처리)
- `iztro@2.5.x` — 자미두수 12궁/14주성/보좌성 계산
- `@anthropic-ai/sdk@0.90` — 모든 AI 해석. 모델: `claude-haiku-4-5-20251001`

## 아키텍처 원칙
1. **명식 계산은 코드, 해석만 AI**. AI 프롬프트엔 항상 정밀 계산된 명식 블록을 넣어준다.
2. **캐릭터별 말투 = [app/lib/voices.ts](app/lib/voices.ts)** 의 `voiceBlock(VOICES.xxx)` 호출. 모든 라우트에 적용.
3. **마크다운 잔재 금지** — 모든 응답을 [app/lib/sanitize.ts](app/lib/sanitize.ts)의 `stripMarkdown()` 통과시킴. 프롬프트엔 `NO_MARKDOWN_RULE` 명시.
4. **무료 제한 = [app/lib/limits.ts](app/lib/limits.ts)**. localStorage 기반(브라우저별), daily/yearly/lifetime 3종.
5. **캐릭터 페이지 패턴**: 챕터 메뉴 → (정보 없으면) 폼 → 자동으로 챕터 메뉴 + 그 챕터 풀이. 정보 있으면 폼 스킵.

## 챕터 시스템 (사주 / 자미두수)
[app/lib/saju-chapters.ts](app/lib/saju-chapters.ts) , [app/lib/jami-chapters.ts](app/lib/jami-chapters.ts)
- 한 캐릭터당 9~10개 챕터 (年/命/緣/財/職/康/家/福/運/歲 한자 아이콘)
- 각 챕터: `id`, `icon`, `title`, `desc`, `price` (0=무료), `promptTitle`, `promptInstruction`
- 무료 챕터는 `price: 0`, 유료는 1,900~2,900원
- 개발 모드(`process.env.NODE_ENV === "development"`)에서 모든 유료 챕터가 자동 무료 + [DEV] 재생성 버튼 노출

## API 라우트 (`app/api/*/route.ts`)
모두 동일 패턴:
1. 입력 검증
2. (사주류만) 만세력 계산 → `formatXxxForPrompt()`
3. Anthropic 호출 (`max_tokens` 챕터 무게에 따라 조절: 가벼움 1200 / 중간 3000 / 무거움 5500~7500)
4. `stripMarkdown()` 후 응답

## 무료 제한 라이브러리
```ts
import { LIMITS, checkLimit, recordUsage, saveResult, loadResult } from "@/app/lib/limits";

const limit = checkLimit(LIMITS.today);  // { allowed, used, max, remaining, resetText }
recordUsage(LIMITS.today);               // 사용 1회 기록
saveResult("today", payload);            // 결과 캐시 (버전 관리됨)
loadResult<T>("today");                  // 캐시 복원
```
- LIMITS 키 변경 시 자동으로 옛 캐시 무효화 (key suffix `_v2` 등)

## 작업 시 주의사항

### 새 챕터 추가
1. `*-chapters.ts` 에 `ChapterDef` 추가 (icon은 한자 한 글자 권장)
2. `promptInstruction`에 ✦로 시작하는 섹션 구조 명시
3. API의 `max_tokens` 분기에 챕터 ID 추가 검토

### 새 캐릭터 페이지 추가
1. `app/lib/voices.ts` 에 `VoiceProfile` 추가
2. `app/{name}/page.tsx` 작성 — 사주/자미두수 페이지 구조 복붙
3. `app/api/{name}/route.ts` 작성
4. 홈 페이지 [app/page.tsx](app/page.tsx) 의 `characters` 배열에 추가
5. (필요 시) [app/lib/limits.ts](app/lib/limits.ts) 에 LIMIT 추가

### AI 응답이 잘릴 때
- max_tokens 부족 → 올림 (Haiku 4.5 한도 8192)
- 또는 프롬프트의 섹션 수/길이 줄이기 ("짧게 한 줄씩만" 명시)

### AI 응답이 두루뭉술할 때
- [app/lib/voices.ts](app/lib/voices.ts) 의 `READABILITY_RULE`에 이미 구체성 원칙 강제
- 추가 강화 필요 시 라우트 프롬프트에 직접 "구체적 시기/인물/행동 명시" 강조

### 마크다운(`**`)이 보일 때
- `stripMarkdown()` 호출 누락 확인
- `NO_MARKDOWN_RULE` 프롬프트에 들어있는지 확인

### 외부 공유 (cloudflare 터널)
- `npx cloudflared tunnel --url http://localhost:3000` 으로 임시 URL 발급
- 발급된 도메인을 [next.config.ts](next.config.ts) `allowedDevOrigins` 배열에 추가 (안 하면 클릭 안 됨)
- dev 서버는 config 변경 시 자동 재시작

## 환경변수
- `ANTHROPIC_API_KEY` — `.env.local` 에. 없으면 모든 풀이 500 에러.
- API 한도 도달 시 에러 메시지: "You have reached your specified API usage limits..."

## 보류 중 / 미구현
- 밀서(密書) — 성인 캐릭터, 페이지 미구현
- 결제 시스템 — 유료 챕터는 현재 [DEV] 모드에서만 동작
- 보관함 (홈 하단 📦 탭) — 라우트만 있고 페이지 미구현
- 진태양시(眞太陽時) 보정 — 출생지 경도 고려 안 함, 한국 표준시 그대로
- 신살(神煞) 자동 계산 — 12운성/공망만 사용 중
