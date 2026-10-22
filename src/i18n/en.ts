import { ph, type Dictionary } from './mark';

export const en = {
  meta: {
    title: ph('MPTour — tours in Foz do Iguaçu'),
    description: ph(
      'In Foz, you see the Falls from both sides, hear the water, stop at Itaipu, and cross into Paraguay.',
    ),
  },
  nav: {
    territories: ph('The places'),
    experiences: ph('The tours'),
    method: ph('How it works'),
    cta: ph('Message us on WhatsApp'),
  },
  hero: {
    eyebrow: ph('Foz do Iguaçu'),
    titleLead: ph('You hear the water'),
    titleEm: ph('before you see it.'),
    lede: ph(
      'We take you to the Falls, on the Brazilian side and the Argentine side. Itaipu and Paraguay too. We go at your pace.',
    ),
    cta: ph('Message us on WhatsApp'),
    secondary: ph('See the tours'),
    pause: ph('Pause video'),
    play: ph('Play video'),
  },
  manifesto: {
    kicker: ph('Who takes you'),
    quote: ph('You feel the water on your face and hear the river. We handle the way there.'),
    facts: [ph('Private tour'), ph('A guide who lives in Foz'), ph('Brazil, Argentina, Paraguay')],
  },
  territories: {
    kicker: ph('Around here'),
    title: ph('Five places on the border.'),
    lede: ph(
      'The walkway in Brazil, the falls in Argentina, the dam, the bridge, and where the rivers meet.',
    ),
    items: [
      {
        name: ph('Falls'),
        place: ph('Brazil'),
        text: ph('The walkway gets close to the water. The spray hits your face.'),
        image: 'falls-br',
      },
      {
        name: ph('Falls'),
        place: ph('Argentina'),
        text: ph('You can get right up to the falls. You come back with wet clothes.'),
        image: 'falls-ar',
      },
      {
        name: ph('Itaipu'),
        place: ph('Brazil and Paraguay'),
        text: ph('The dam fills the whole view. The Paraná runs wide below it.'),
        image: 'itaipu',
      },
      {
        name: ph('Paraguay'),
        place: ph('The bridge'),
        text: ph('The Friendship Bridge is windy. Ciudad del Este starts on the other side.'),
        image: 'paraguay',
      },
      {
        name: ph('Three Borders'),
        place: ph('The marker'),
        text: ph('The Iguaçu meets the Paraná. From there you can see all three countries.'),
        image: 'frontier',
      },
    ],
  },
  regionMap: {
    title: ph('Where each place is'),
    idleMeta: ph('Five places'),
    idleTitle: ph('Pick a place.'),
    idleText: ph('Everything sits between the Paraná and the Iguaçu.'),
    link: ph('Look at this place'),
    countries: {
      br: ph('Brazil'),
      ar: ph('Argentina'),
      py: ph('Paraguay'),
    },
    points: [
      { image: 'falls-br', name: ph('Falls on the Brazilian side'), label: ph('Falls') },
      { image: 'falls-ar', name: ph('Falls on the Argentine side'), label: ph('Falls') },
      { image: 'itaipu', name: ph('Itaipu'), label: ph('Itaipu') },
      {
        image: 'paraguay',
        name: ph('Paraguay (Ciudad del Este)'),
        label: ph('Paraguay'),
      },
      {
        image: 'frontier',
        name: ph('Mark of the Three Borders'),
        label: ph('Mark'),
      },
    ],
  },
  experiences: {
    kicker: ph('Tours'),
    title: ph('What fits in your day.'),
    lede: ph(
      'Tell us who is coming and what you want to see. Half a day, a full day, several days, or custom.',
    ),
    items: [
      {
        title: ph('San Martín, slowly'),
        territory: ph('Falls · Argentina'),
        duration: ph('However you want'),
        image: 'exp-san-martin',
      },
      {
        title: ph('The Brazilian walkway'),
        territory: ph('Falls · Brazil'),
        duration: ph('However you want'),
        image: 'exp-walkway',
      },
      {
        title: ph('Itaipu up close'),
        territory: ph('Itaipu'),
        duration: ph('However you want'),
        image: 'exp-itaipu',
      },
      {
        title: ph('The bridge to Paraguay'),
        territory: ph('Paraguay'),
        duration: ph('However you want'),
        image: 'exp-bridge',
      },
      {
        title: ph('Brazil on one side, Argentina on the other'),
        territory: ph('Falls'),
        duration: ph('However you want'),
        image: 'exp-curtain',
      },
    ],
  },
  method: {
    kicker: ph('How it works'),
    title: ph('You tell us. We take you.'),
    steps: [
      {
        title: ph('You tell us'),
        text: ph('Who is coming, what you want to see up close, and what can wait.'),
      },
      {
        title: ph('We put it together'),
        text: ph('The car, the time, and the order: parks, dam, and bridge.'),
      },
      {
        title: ph('We go with you'),
        text: ph('You just look. We handle the timing, the crossing, and the ride back.'),
      },
    ],
  },
  plan: {
    kicker: ph('WhatsApp'),
    title: ph('Say hello. We answer from here.'),
    text: ph('Write in Portuguese, Spanish, or English.'),
    cta: ph('Message us on WhatsApp'),
    note: ph('A message is not a booking yet. We arrange the rest there.'),
  },
  footer: {
    place: ph('Foz do Iguaçu · Paraná · Brazil'),
    legal: ph('The photos and videos are still temporary. The number above is our WhatsApp.'),
    credits: ph('Photo and video credits'),
  },
  credits: {
    title: ph('Photo and video credits'),
    lede: ph(
      'The photos and videos are still temporary. Source, author, and license are listed below.',
    ),
  },
  missing: {
    kicker: ph('404'),
    title: ph('Nothing here.'),
    text: ph('That address does not go anywhere.'),
    link: ph('Back to the start'),
  },
} satisfies Dictionary;
