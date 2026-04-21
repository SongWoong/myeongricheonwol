"use client";

import { useEffect, useRef } from "react";

export default function Preview({ html }: { html: string }) {
  const ref = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const iframe = ref.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
  }, [html]);

  return (
    <iframe
      ref={ref}
      title="미리보기"
      style={{
        width: "100%",
        height: "100%",
        border: "none",
        background: "#fff",
        borderRadius: 8,
      }}
    />
  );
}
