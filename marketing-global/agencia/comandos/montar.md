# /montar <país>
**Função:** popular o template-mestre com o copy do país via Plugin ARKHE.
**Pré-requisito:** Plugin ARKHE instalado (dev local) — enquanto não existir, gerar tabela de montagem manual (camada → texto → fonte → direção RTL/LTR).
**Processo do plugin:** 1) Ler `pecas/<país>/01-copy-*.md`. 2) Duplicar frames do mestre. 3) Substituir variáveis, aplicar fonte do script, forçar RTL quando locale he/fa. 4) Nomear frames `<país>-<formato>-<variação>`.
**Gate:** RTL auditado é gate de saída para IL/IR (regra do Playbook).
