import { ph, type Dictionary } from './mark';

export const pt = {
  meta: {
    title: ph('MPTour — Foz do Iguaçu'),
    description: ph(
      'PLACEHOLDER. Roteiros privativos em Foz do Iguaçu: Cataratas do Iguaçu no Brasil e na Argentina, Itaipu, Paraguai e Três Fronteiras.',
    ),
  },
  nav: {
    territories: ph('Territórios'),
    experiences: ph('Experiências'),
    method: ph('Como funciona'),
    cta: ph('Monte seu roteiro'),
  },
  hero: {
    eyebrow: ph('Foz do Iguaçu'),
    titleLead: ph('A água, a mata'),
    titleEm: ph('e três fronteiras.'),
    lede: ph(
      'Roteiros privativos entre o Brasil, a Argentina e o Paraguai — no ritmo de quem vive na fronteira.',
    ),
    cta: ph('Monte seu roteiro'),
    secondary: ph('Ver experiências'),
    pause: ph('Pausar vídeo'),
    play: ph('Tocar vídeo'),
  },
  manifesto: {
    kicker: ph('A casa'),
    quote: ph(
      'O dia não vem de um catálogo. Começa no que você quer ver de perto, e no que o rio esconde.',
    ),
    facts: [ph('Roteiros privativos'), ph('Guias da fronteira'), ph('Brasil, Argentina, Paraguai')],
  },
  territories: {
    kicker: ph('O território'),
    title: ph('Cinco margens do mesmo mapa.'),
    lede: ph(
      'Cataratas dos dois lados, a barragem, o Paraguai e o ponto em que os rios se encontram.',
    ),
    items: [
      {
        name: ph('Cataratas'),
        place: ph('Brasil'),
        text: ph('A passarela, a mata e o vapor que sobe do rio.'),
        image: 'falls-br',
      },
      {
        name: ph('Cataratas'),
        place: ph('Argentina'),
        text: ph('O salto, a névoa e a mata em volta.'),
        image: 'falls-ar',
      },
      {
        name: ph('Itaipu'),
        place: ph('Brasil e Paraguai'),
        text: ph('A barragem e o tamanho real do Paraná.'),
        image: 'itaipu',
      },
      {
        name: ph('Paraguai'),
        place: ph('Na outra margem'),
        text: ph('O rio, a ponte e a cidade do outro lado.'),
        image: 'paraguay',
      },
      {
        name: ph('Três Fronteiras'),
        place: ph('O encontro'),
        text: ph('O Iguaçu entrega o mapa ao Paraná.'),
        image: 'frontier',
      },
    ],
  },
  regionMap: {
    title: ph('Mapa da região'),
    idleMeta: ph('Cinco pontos'),
    idleTitle: ph('Escolha um lugar.'),
    idleText: ph('Toque um ponto entre o Paraná e o Iguaçu.'),
    link: ph('Ver território'),
    countries: {
      br: ph('Brasil'),
      ar: ph('Argentina'),
      py: ph('Paraguai'),
    },
    points: [
      { image: 'falls-br', name: ph('Cataratas lado brasileiro'), label: ph('Cataratas') },
      { image: 'falls-ar', name: ph('Cataratas lado argentino'), label: ph('Cataratas') },
      { image: 'itaipu', name: ph('Itaipu'), label: ph('Itaipu') },
      {
        image: 'paraguay',
        name: ph('Paraguai (Ciudad del Este)'),
        label: ph('Paraguai'),
      },
      {
        image: 'frontier',
        name: ph('Marco das Três Fronteiras'),
        label: ph('Marco'),
      },
    ],
  },
  experiences: {
    kicker: ph('Experiências'),
    title: ph('O que um dia pode ser.'),
    lede: ph('Nada de prateleira. A conversa define o ritmo, as pessoas e a travessia.'),
    items: [
      {
        title: ph('San Martín, devagar'),
        territory: ph('Cataratas · Argentina'),
        duration: ph('Dia inteiro'),
        image: 'exp-san-martin',
      },
      {
        title: ph('A passarela brasileira'),
        territory: ph('Cataratas · Brasil'),
        duration: ph('Meio dia'),
        image: 'exp-walkway',
      },
      {
        title: ph('A escala de Itaipu'),
        territory: ph('Itaipu'),
        duration: ph('Meio dia'),
        image: 'exp-itaipu',
      },
      {
        title: ph('O rio entre as cidades'),
        territory: ph('Paraguai'),
        duration: ph('Meio dia'),
        image: 'exp-bridge',
      },
      {
        title: ph('A cortina de água'),
        territory: ph('Cataratas'),
        duration: ph('Dois dias'),
        image: 'exp-curtain',
      },
    ],
  },
  method: {
    kicker: ph('Como funciona'),
    title: ph('Três tempos, nenhuma pressa.'),
    steps: [
      {
        title: ph('Conte'),
        text: ph('O ritmo, as pessoas, o que você quer ver de perto e o que pode ficar de fora.'),
      },
      {
        title: ph('Desenhamos'),
        text: ph('Um dia, ou vários, entre os dois parques, a barragem e a outra margem.'),
      },
      {
        title: ph('Acompanhamos'),
        text: ph('Você fica com o lugar. A gente cuida da travessia, do horário e do retorno.'),
      },
    ],
  },
  plan: {
    kicker: ph('Roteiro'),
    title: ph('Quando quiser, a gente desenha o dia.'),
    text: ph('Uma mensagem no WhatsApp. Alguém daqui responde, em português, español ou English.'),
    cta: ph('Monte seu roteiro'),
    note: ph('A conversa não reserva nada sozinha.'),
  },
  footer: {
    place: ph('Foz do Iguaçu · Paraná · Brasil'),
    legal: ph('Textos e fotografias são PLACEHOLDER. O número acima é o canal oficial.'),
    credits: ph('Créditos'),
  },
  credits: {
    title: ph('Créditos'),
    lede: ph('Fotografias provisórias. O autor e a licença de cada arquivo estão abaixo.'),
  },
  missing: {
    kicker: ph('404'),
    title: ph('Fora do mapa.'),
    text: ph('PLACEHOLDER — este endereço não leva a nenhum roteiro.'),
    link: ph('Voltar ao início'),
  },
} satisfies Dictionary;
