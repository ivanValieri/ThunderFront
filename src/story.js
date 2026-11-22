// Dados do modo história. As artes dos cartões entram em src/assets/story/cards/ com o nome do cartão
// (P0.jpg, 1A.jpg, 1B.jpg...). Enquanto não existem, o jogo usa o cenário escurecido como arte provisória.
export const CHAPTERS = [
  { id: 1, nome: 'O Primeiro Ataque', cenario: 1, nivel: 1, pronto: true, abertura: ['P0', '1A'], encerramento: ['1B'] },
  { id: 2, nome: 'Ilha Esmeralda', cenario: 2, nivel: 5, pronto: false, abertura: [], encerramento: [] },
  { id: 3, nome: 'Ruínas do Deserto', cenario: 3, nivel: 8, pronto: false, abertura: [], encerramento: [] },
  { id: 4, nome: 'Cânion Gelado', cenario: 4, nivel: 12, pronto: false, abertura: [], encerramento: [] },
  { id: 5, nome: 'A Represa', cenario: 5, nivel: 16, pronto: false, abertura: [], encerramento: [] },
  { id: 6, nome: 'O Vulcão', cenario: 6, nivel: 20, pronto: false, abertura: [], encerramento: [] },
  { id: 7, nome: 'Fortaleza Ártica', cenario: 7, nivel: 25, pronto: false, abertura: [], encerramento: [] },
]

export const CARDS = {
  P0: { titulo: 'PRÓLOGO', cenario: 1, paginas: ['Durante anos, o Vale Verde viveu em paz. Até que a Legião Carmim cruzou as montanhas com uma frota de bombardeiros. Nenhuma cidade estava preparada. Você será a resposta.'] },
  '1A': { titulo: 'CAPÍTULO 1 · O PRIMEIRO ATAQUE', cenario: 1, paginas: ['O sol mal nasceu quando o alarme soou na torre de Vale Verde. Os bombardeiros vêm do norte, e a vila é o primeiro alvo. Piloto, decole. Hoje o céu é seu.'] },
  '1B': { titulo: 'CAPÍTULO 1 · CONCLUÍDO', cenario: 1, paginas: ['O bombardeiro caiu além do rio, e os sinos da vila voltaram a tocar. Mas o mapa na cabine inimiga mostra uma rota: as ilhas ao sul. A guerra apenas começou.'] },
  A1: { titulo: 'DIÁRIO DA VILA', cenario: 1, ambiente: true, paginas: ['À noite, os moleiros enchem sacos de farinha para os pilotos. “Quem defende o pão, defende a esperança”, diz dona Marta.'] },
  A2: { titulo: 'RÁDIO INTERCEPTADO', cenario: 1, ambiente: true, paginas: ['…chegada ao amanhecer… ignorem a escolta… o alvo é a vila do moinho… repito, o alvo é…'] },
  A3: { titulo: 'CARTA DA COMANDANTE', cenario: 1, ambiente: true, paginas: ['Seus resultados chegaram ao quartel, piloto. Continue assim, e logo teremos aviões melhores para você. Maj. Duarte.'] },
}
export const CARD_ORDER = Object.keys(CARDS)
export const AMBIENT = ['A1', 'A2', 'A3']
// freio: cartão de ambientação no máximo a cada 3 partidas
export const AMBIENT_A_CADA = 3
