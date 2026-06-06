// Os 22 Arcanos Maiores — leitura iniciática do AquariOS (SandeirOS / Jornada)
// Base: AQUARIOS_LIVRO Tomo III. Linguagem como espelho, nunca como adivinhação.

export interface Arcano {
  num: number;
  name: string;
  emoji: string;
  keyword: string;
  prompt: string; // pergunta reflexiva — devolve agência ao usuário
}

export const ARCANOS: Arcano[] = [
  { num: 0,  name: 'O Louco',           emoji: '🃏', keyword: 'Liberdade · recomeço',     prompt: 'Que salto você está pronto pra dar, mesmo sem garantias?' },
  { num: 1,  name: 'O Mago',            emoji: '🪄', keyword: 'Vontade · início',         prompt: 'Que poder de começar já está nas suas mãos hoje?' },
  { num: 2,  name: 'A Sacerdotisa',     emoji: '🌙', keyword: 'Sabedoria que guarda',     prompt: 'O que você já sabe, mas ainda não admitiu pra si?' },
  { num: 3,  name: 'A Imperatriz',      emoji: '🌺', keyword: 'Criação · nutrição',       prompt: 'O que em você pede pra ser cuidado e nutrido?' },
  { num: 4,  name: 'O Imperador',       emoji: '🏛️', keyword: 'Estrutura · ordem',        prompt: 'Que estrutura te daria mais liberdade — e não menos?' },
  { num: 5,  name: 'O Hierofante',      emoji: '📿', keyword: 'Tradição · ensino',        prompt: 'Que verdade aprendida merece ser, com respeito, questionada?' },
  { num: 6,  name: 'Os Enamorados',     emoji: '💞', keyword: 'Escolha · amor',           prompt: 'Diante de dois caminhos, qual te aproxima de quem você quer ser?' },
  { num: 7,  name: 'O Carro',           emoji: '🛞', keyword: 'Autodomínio · direção',    prompt: 'Onde você precisa, com calma, retomar as rédeas?' },
  { num: 8,  name: 'A Justiça',         emoji: '⚖️', keyword: 'Equilíbrio · verdade',     prompt: 'Que conta interna pede pra ser acertada com honestidade?' },
  { num: 9,  name: 'O Eremita',         emoji: '🏮', keyword: 'Recolhimento · luz',       prompt: 'Que resposta só o silêncio consegue te dar agora?' },
  { num: 10, name: 'A Roda da Fortuna', emoji: '🎡', keyword: 'Ciclos · retorno',         prompt: 'Que ciclo está girando — e o que ele pede de você?' },
  { num: 11, name: 'A Força',           emoji: '🦁', keyword: 'Coragem suave',            prompt: 'Onde a gentileza seria mais forte que a luta?' },
  { num: 12, name: 'O Enforcado',       emoji: '🙃', keyword: 'Inversão · entrega',       prompt: 'O que muda se você olhar isso de cabeça pra baixo?' },
  { num: 13, name: 'A Transformação',   emoji: '🦋', keyword: 'Fim que vira começo',      prompt: 'O que precisa terminar pra algo novo poder nascer?' },
  { num: 14, name: 'A Temperança',      emoji: '🧪', keyword: 'Medida · dose',            prompt: 'Onde falta medida na sua vida — excesso ou escassez?' },
  { num: 15, name: 'O Diabo',           emoji: '⛓️', keyword: 'Apego · sombra',           prompt: 'Que corrente você poderia soltar — e finge não ver?' },
  { num: 16, name: 'A Torre',           emoji: '⚡', keyword: 'Ruptura · despertar',      prompt: 'Que estrutura falsa precisa cair pra te libertar?' },
  { num: 17, name: 'A Estrela',         emoji: '⭐', keyword: 'Esperança · fé',           prompt: 'Onde você pode reacender uma esperança hoje?' },
  { num: 18, name: 'A Lua',             emoji: '🌚', keyword: 'Inconsciente · medo',      prompt: 'Que medo está distorcendo o que você enxerga?' },
  { num: 19, name: 'O Sol',             emoji: '☀️', keyword: 'Clareza · alegria',        prompt: 'O que te traria uma alegria simples agora?' },
  { num: 20, name: 'O Julgamento',      emoji: '📯', keyword: 'Renascimento · chamado',   prompt: 'A que chamado interior você ainda precisa responder?' },
  { num: 21, name: 'O Mundo',           emoji: '🌍', keyword: 'Integração · plenitude',   prompt: 'O que em você já está inteiro e merece ser celebrado?' },
];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Arcano do dia — determinístico por usuário + data (estável durante o dia). */
export function arcanoDoDia(userId: string, date: Date = new Date()): Arcano {
  const days = Math.floor(date.getTime() / 86400000);
  const idx = (days + hashStr(userId || 'anon')) % ARCANOS.length;
  return ARCANOS[idx];
}
