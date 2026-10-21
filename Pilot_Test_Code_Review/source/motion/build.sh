#!/bin/bash
cd "$(dirname "$0")"
{ echo '<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>오피스퀘스트 × 효성마을 — 20초 소개 모션그래픽</title>';
  echo '<link rel="preconnect" href="https://fastly.jsdelivr.net" crossorigin><style>'; cat a.css; echo '</style></head><body>'; cat b.html; echo '<script>'; cat c.js; echo '</script></body></html>'; } > ../../motion/officequest_intro.html
