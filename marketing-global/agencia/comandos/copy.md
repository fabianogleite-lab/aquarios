# /copy <país> <formato:feed|story|ooh|banner|legenda>
**Função:** headlines, body e CTA no idioma local + versão PT lado a lado.
**Processo:** 1) Carregar /brief do país (criar se não existir). 2) Aplicar voz cultural (`proteos-cultural-voice.ts` do locale) + Big Idea. 3) Gerar 3 variações A/B/C por formato. 4) Autoaplicar /cerberos antes de entregar.
**Restrições:** claims conforme Parte 0 do Playbook ("curar a fragmentação", nunca doença) · script nativo correto (RTL para he/fa) · texto SEMPRE como texto, nunca instrução de desenhar texto em imagem.
**Saída:** `pecas/<país>/01-copy-<formato>.md` com tabela variação × local × PT.
