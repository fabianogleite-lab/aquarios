# /template <formato>
**Função:** especificar o template-mestre do Figma com variáveis para os 14 países.
**Processo:** 1) Definir frame base do formato + grid + áreas nomeadas: #headline #body #cta #legal #logo. 2) Mapear fonte por script: Latin (Inter/Manrope), he-IL (Heebo/Assistant, RTL), fa-IR (Vazirmatn, RTL), th-TH (Sarabun/Noto Thai), ko-KR (Pretendard/Noto KR), zh-HK (Noto Sans TC). 3) Documentar regras de auto-layout para expansão de texto (CJK curto, alemão longo). 4) Importar SVG de /arte como camada de fundo.
**Saída:** spec em `pecas/_templates/<formato>.md` (construção manual no Figma na 1ª vez; Plugin ARKHE replica depois).
