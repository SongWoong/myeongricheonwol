/** AI 응답에서 마크다운 잔재(**, ##, ` 등)를 제거 */
export function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*\*(.+?)\*\*\*/g, "$1")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/(?<!\*)\*(?!\*)([^\*\n]+?)\*(?!\*)/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/`([^`]+)`/g, "$1");
}

export const NO_MARKDOWN_RULE =
  "절대 마크다운 문법(**굵게**, *기울임*, ## 제목, `코드` 등)을 사용하지 마세요. 강조가 필요하면 ✦ 기호나 한자를 활용하세요.";
