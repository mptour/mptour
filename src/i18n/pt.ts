import { ph, type Dictionary } from './mark';

export const pt = {
  meta: {
    title: ph('MPTour — passeios em Foz do Iguaçu'),
    description: ph(
      'Em Foz, você vê as Cataratas dos dois lados, ouve a água, passa em Itaipu e atravessa pro Paraguai.',
    ),
  },
  nav: {
    territories: ph('Os lugares'),
    experiences: ph('Os passeios'),
    method: ph('Como funciona'),
    cta: ph('Chame no WhatsApp'),
  },
  hero: {
    eyebrow: ph('Foz do Iguaçu'),
    titleLead: ph('Você ouve a água'),
    titleEm: ph('antes de ver.'),
    lede: ph(
      'A gente leva você nas Cataratas, do lado brasileiro e do argentino. Itaipu e o Paraguai também. A gente vai no seu tempo.',
    ),
    cta: ph('Chame no WhatsApp'),
    secondary: ph('Ver os passeios'),
    pause: ph('Pausar vídeo'),
    play: ph('Tocar vídeo'),
  },
  manifesto: {
    kicker: ph('Quem leva'),
    quote: ph('Você sente a água no rosto e ouve o rio. O caminho fica com a gente.'),
    facts: [
      ph('Passeio particular'),
      ph('Guia que mora em Foz'),
      ph('Brasil, Argentina, Paraguai'),
    ],
  },
  territories: {
    kicker: ph('Por aqui'),
    title: ph('Cinco lugares da fronteira.'),
    lede: ph(
      'A passarela no Brasil, os saltos na Argentina, a barragem, a ponte e o encontro dos rios.',
    ),
    items: [
      {
        name: ph('Cataratas'),
        place: ph('Brasil'),
        text: ph('A passarela chega perto da água. O respingo bate no rosto.'),
        image: 'falls-br',
      },
      {
        name: ph('Cataratas'),
        place: ph('Argentina'),
        text: ph('Dá pra chegar bem perto dos saltos. Você volta com a roupa molhada.'),
        image: 'falls-ar',
      },
      {
        name: ph('Itaipu'),
        place: ph('Brasil e Paraguai'),
        text: ph('A barragem ocupa a vista inteira. O rio Paraná passa largo lá embaixo.'),
        image: 'itaipu',
      },
      {
        name: ph('Paraguai'),
        place: ph('A ponte'),
        text: ph('Venta na Ponte da Amizade. Ciudad del Este começa do outro lado.'),
        image: 'paraguay',
      },
      {
        name: ph('Três Fronteiras'),
        place: ph('O marco'),
        text: ph('O Iguaçu encontra o Paraná. Dali dá pra ver os três países.'),
        image: 'frontier',
      },
    ],
  },
  regionMap: {
    title: ph('Onde fica cada lugar'),
    idleMeta: ph('Cinco lugares'),
    idleTitle: ph('Escolha um lugar.'),
    idleText: ph('Tudo fica entre o rio Paraná e o Iguaçu.'),
    link: ph('Olhe esse lugar'),
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
    kicker: ph('Passeios'),
    title: ph('O que cabe no seu dia.'),
    lede: ph(
      'Você diz quem vai e o que quer ver. Meio dia, dia inteiro, vários dias ou sob medida.',
    ),
    items: [
      {
        title: ph('San Martín com calma'),
        territory: ph('Cataratas · Argentina'),
        duration: ph('Do jeito que você quiser'),
        image: 'exp-san-martin',
      },
      {
        title: ph('A passarela brasileira'),
        territory: ph('Cataratas · Brasil'),
        duration: ph('Do jeito que você quiser'),
        image: 'exp-walkway',
      },
      {
        title: ph('Itaipu de perto'),
        territory: ph('Itaipu'),
        duration: ph('Do jeito que você quiser'),
        image: 'exp-itaipu',
      },
      {
        title: ph('A ponte pro Paraguai'),
        territory: ph('Paraguai'),
        duration: ph('Do jeito que você quiser'),
        image: 'exp-bridge',
      },
      {
        title: ph('Brasil de um lado, Argentina do outro'),
        territory: ph('Cataratas'),
        duration: ph('Do jeito que você quiser'),
        image: 'exp-curtain',
      },
    ],
  },
  method: {
    kicker: ph('Como funciona'),
    title: ph('Você fala. A gente leva.'),
    steps: [
      {
        title: ph('Você conta'),
        text: ph('Quem vai, o que quer ver de perto, e o que pode ficar pra outro dia.'),
      },
      {
        title: ph('A gente monta'),
        text: ph('O carro, o horário e a ordem: parques, barragem e ponte.'),
      },
      {
        title: ph('A gente vai junto'),
        text: ph('Você só olha. A gente cuida do horário, da travessia e da volta.'),
      },
    ],
  },
  plan: {
    kicker: ph('WhatsApp'),
    title: ph('Mande um oi. A gente responde daqui.'),
    text: ph('Pode escrever em português, espanhol ou English.'),
    cta: ph('Chame a gente no WhatsApp'),
    note: ph('Mandar mensagem ainda não é reserva. A gente combina tudo por lá.'),
  },
  footer: {
    place: ph('Foz do Iguaçu · Paraná · Brasil'),
    legal: ph('As fotos e os vídeos ainda são provisórios. O número acima é o nosso WhatsApp.'),
    credits: ph('Créditos das fotos e dos vídeos'),
  },
  credits: {
    title: ph('Créditos das fotos e dos vídeos'),
    lede: ph(
      'As fotos e os vídeos ainda são provisórios. Aqui embaixo tem a fonte, o autor e a licença de cada um.',
    ),
  },
  missing: {
    kicker: ph('404'),
    title: ph('Não existe.'),
    text: ph('Esse endereço não leva a lugar nenhum.'),
    link: ph('Volte pro começo'),
  },
} satisfies Dictionary;
