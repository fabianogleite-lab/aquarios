# /template feed — Spec do Template-Mestre 1080×1080 (Figma Starter)
**Grid:** margens 80px · coluna única central · zona segura 920×920.
**Camadas nomeadas (ordem):** bg-arte (SVG de /arte, full-bleed) → #headline (x80 y560 w920, Inter/Manrope Bold 72–88px, auto-resize) → #body (x80 y760 w920, Regular 34px, máx 4 linhas) → #cta (pill x80 y940 h72, Semibold 30px, fundo #52C98A texto #0B1026) → #logo (x80 y80, AquariOS wordmark branco 40px) → #legal (x80 y1010, 18px, opcional).
**Fontes por script (para reuso global):** Latin Inter/Manrope · he-IL Heebo (RTL) · fa-IR Vazirmatn (RTL) · th-TH Sarabun · ko-KR Pretendard · zh-HK Noto Sans TC. RTL: alinhar à direita + direction RTL no texto.
**Regra de expansão:** CJK encurta (~40%), alemão alonga (~30%) — auto-layout vertical no bloco de texto.
**Variações:** duplicar frame por headline A/B/C → nome `brasil-feed-A|B|C`.
