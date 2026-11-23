// Falas de rádio do combate. dur = duração do áudio em segundos (usada para a legenda).
// pr = prioridade (uma fala de prioridade maior interrompe a de menor); cd = intervalo mínimo para repetir (s).
// Falas G02, G03 e C1-01 a C1-05 ficam prontas para as missões com objetivo (próxima parte).
export const WHO = {
  torre: { nome: 'TORRE VALE', cor: '#9fe3ff' },
  major: { nome: 'MAJ. DUARTE', cor: '#ffc400' },
}
export const RADIO = {
  'G01': { who: 'torre', txt: 'Contatos ao norte, Trovão-1. Limpe o espaço aéreo.', dur: 4.04, pr: 1 },
  'G02': { who: 'torre', txt: 'Boa! Metade da missão. Continue assim.', dur: 3.0, pr: 1 },
  'G03': { who: 'torre', txt: 'Faltam poucos. Não deixe um só escapar.', dur: 2.98, pr: 1 },
  'G04': { who: 'torre', txt: 'Missão cumprida. Volte à base, bom trabalho.', dur: 2.73, pr: 3 },
  'G05': { who: 'torre', txt: 'Trovão-1 abatido! Resgate a caminho. Tente de novo.', dur: 3.4, pr: 3 },
  'G06': { who: 'torre', txt: 'Cuidado, Trovão-1! Casco em estado crítico!', dur: 3.18, pr: 2, cd: 25 },
  'G07': { who: 'major', txt: 'Contato enorme se aproximando. É o chefe!', dur: 3.0, pr: 2 },
  'G08': { who: 'major', txt: 'Ele é blindado! Tiro fraco quase não adianta. Use o Laser e a bomba!', dur: 5.56, pr: 2 },
  'G09': { who: 'torre', txt: 'Está cedendo! Mais um pouco!', dur: 1.96, pr: 2 },
  'G10': { who: 'major', txt: 'Ele vai cair! Acabe com isso!', dur: 2.32, pr: 2 },
  'G11': { who: 'major', txt: 'Chefe abatido. Excelente trabalho, piloto!', dur: 3.23, pr: 3 },
  'G12': { who: 'major', txt: 'Promoção confirmada, piloto. Bom trabalho!', dur: 2.66, pr: 3 },
  'G13': { who: 'major', txt: 'Nova habilidade liberada. Boa sorte, piloto.', dur: 3.24, pr: 3 },
  'C1-01': { who: 'torre', txt: 'Bombardeiros rumo à vila! Derrube todos antes que passem!', dur: 3.88, pr: 2 },
  'C1-02': { who: 'torre', txt: 'Um passou! A vila foi atingida. Defesa em 2 de 3!', dur: 4.3, pr: 2 },
  'C1-03': { who: 'torre', txt: 'Última chance! Mais um e a vila cai!', dur: 2.67, pr: 2 },
  'C1-04': { who: 'major', txt: 'Vila salva. Os moradores agradecem, piloto.', dur: 3.33, pr: 3 },
  'C1-05': { who: 'torre', txt: 'A vila caiu… Vamos reorganizar e tentar outra vez.', dur: 4.12, pr: 3 },
  'C1-06': { who: 'major', txt: 'Bombardeiro abatido. O Vale Verde está livre!', dur: 3.35, pr: 3 },
}
