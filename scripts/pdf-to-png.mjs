// test-output.pdf → PNG 페이지별 저장 (육안 확인용)
import { pdf } from "pdf-to-img";
import { writeFileSync, mkdirSync } from "node:fs";

mkdirSync("pdf-preview", { recursive: true });
let n = 0;
const doc = await pdf("test-output.pdf", { scale: 1.5 });
for await (const page of doc) {
  n++;
  writeFileSync(`pdf-preview/page-${String(n).padStart(2, "0")}.png`, page);
}
console.log(`saved ${n} pages → pdf-preview/`);
