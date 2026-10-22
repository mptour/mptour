import { ph, type Dictionary } from './mark';

/** Spanish for visitors from Argentina and Paraguay. Formal usted. */
export const es = {
  meta: {
    title: ph('MPTour — paseos en Foz do Iguaçu'),
    description: ph(
      'En Foz, usted ve las Cataratas de los dos lados, escucha el agua, pasa por Itaipú y cruza a Paraguay.',
    ),
  },
  nav: {
    territories: ph('Los lugares'),
    experiences: ph('Los paseos'),
    method: ph('Cómo funciona'),
    cta: ph('Escríbanos por WhatsApp'),
  },
  hero: {
    eyebrow: ph('Foz do Iguaçu'),
    titleLead: ph('Usted escucha el agua'),
    titleEm: ph('antes de verla.'),
    lede: ph(
      'Lo llevo a las Cataratas, del lado brasileño y del argentino. También a Itaipú y a Paraguay. El tiempo es el suyo.',
    ),
    cta: ph('Escríbanos por WhatsApp'),
    secondary: ph('Ver los paseos'),
    pause: ph('Pausar video'),
    play: ph('Reproducir video'),
  },
  manifesto: {
    kicker: ph('Quién lo lleva'),
    quote: ph('Usted siente el agua en la cara y escucha el río. El camino queda conmigo.'),
    facts: [ph('Paseo privado'), ph('Guía que vive en Foz'), ph('Brasil, Argentina, Paraguay')],
  },
  territories: {
    kicker: ph('Por acá'),
    title: ph('Cinco lugares de la frontera.'),
    lede: ph(
      'La pasarela en Brasil, los saltos en Argentina, la represa, el puente y el encuentro de los ríos.',
    ),
    items: [
      {
        name: ph('Cataratas'),
        place: ph('Brasil'),
        text: ph('La pasarela llega cerca del agua. El agua le salpica la cara.'),
        image: 'falls-br',
      },
      {
        name: ph('Cataratas'),
        place: ph('Argentina'),
        text: ph('Usted llega bien cerca de los saltos. Usted vuelve con la ropa mojada.'),
        image: 'falls-ar',
      },
      {
        name: ph('Itaipú'),
        place: ph('Brasil y Paraguay'),
        text: ph('La represa ocupa toda la vista. El río Paraná pasa ancho, ahí abajo.'),
        image: 'itaipu',
      },
      {
        name: ph('Paraguay'),
        place: ph('El puente'),
        text: ph('Hay viento en el Puente de la Amistad. Ciudad del Este empieza del otro lado.'),
        image: 'paraguay',
      },
      {
        name: ph('Tres Fronteras'),
        place: ph('El hito'),
        text: ph('El Iguazú se encuentra con el Paraná. Desde ahí se ven los tres países.'),
        image: 'frontier',
      },
    ],
  },
  regionMap: {
    title: ph('Dónde queda cada lugar'),
    idleMeta: ph('Cinco lugares'),
    idleTitle: ph('Elija un lugar.'),
    idleText: ph('Todo queda entre el río Paraná y el Iguazú.'),
    link: ph('Mire este lugar'),
    countries: {
      br: ph('Brasil'),
      ar: ph('Argentina'),
      py: ph('Paraguay'),
    },
    points: [
      { image: 'falls-br', name: ph('Cataratas lado brasileño'), label: ph('Cataratas') },
      { image: 'falls-ar', name: ph('Cataratas lado argentino'), label: ph('Cataratas') },
      { image: 'itaipu', name: ph('Itaipú'), label: ph('Itaipú') },
      {
        image: 'paraguay',
        name: ph('Paraguay (Ciudad del Este)'),
        label: ph('Paraguay'),
      },
      {
        image: 'frontier',
        name: ph('Hito de las Tres Fronteras'),
        label: ph('Hito'),
      },
    ],
  },
  experiences: {
    kicker: ph('Paseos'),
    title: ph('Lo que cabe en su día.'),
    lede: ph(
      'Usted dice quién va y qué quiere ver. Medio día, día entero, varios días o a medida.',
    ),
    items: [
      {
        title: ph('San Martín con calma'),
        territory: ph('Cataratas · Argentina'),
        duration: ph('Como usted quiera'),
        image: 'exp-san-martin',
      },
      {
        title: ph('La pasarela brasileña'),
        territory: ph('Cataratas · Brasil'),
        duration: ph('Como usted quiera'),
        image: 'exp-walkway',
      },
      {
        title: ph('Itaipú de cerca'),
        territory: ph('Itaipú'),
        duration: ph('Como usted quiera'),
        image: 'exp-itaipu',
      },
      {
        title: ph('El puente a Paraguay'),
        territory: ph('Paraguay'),
        duration: ph('Como usted quiera'),
        image: 'exp-bridge',
      },
      {
        title: ph('Brasil de un lado, Argentina del otro'),
        territory: ph('Cataratas'),
        duration: ph('Como usted quiera'),
        image: 'exp-curtain',
      },
    ],
  },
  method: {
    kicker: ph('Cómo funciona'),
    title: ph('Usted habla. Yo lo llevo.'),
    steps: [
      {
        title: ph('Usted cuenta'),
        text: ph('Quién va, qué quiere ver de cerca y qué puede quedar para otro día.'),
      },
      {
        title: ph('Yo armo'),
        text: ph('El auto, el horario y el orden: parques, represa y puente.'),
      },
      {
        title: ph('Voy con usted'),
        text: ph('Usted solo mira. Yo me ocupo del horario, del cruce y de la vuelta.'),
      },
    ],
  },
  plan: {
    kicker: ph('WhatsApp'),
    title: ph('Escríbanos. Le respondo desde acá.'),
    text: ph('Puede escribir en español, en portugués o en inglés.'),
    cta: ph('Escríbanos por WhatsApp'),
    note: ph('Escribir todavía no es una reserva. Lo combinamos por acá.'),
  },
  footer: {
    place: ph('Foz do Iguaçu · Paraná · Brasil'),
    legal: ph(
      'Las fotos y los videos todavía son provisorios. El número de arriba es nuestro WhatsApp.',
    ),
    credits: ph('Créditos de las fotos y los videos'),
  },
  credits: {
    title: ph('Créditos de las fotos y los videos'),
    lede: ph(
      'Las fotos y los videos todavía son provisorios. Abajo están la fuente, el autor y la licencia de cada uno.',
    ),
  },
  missing: {
    kicker: ph('404'),
    title: ph('No existe.'),
    text: ph('Esta dirección no lleva a ningún lugar.'),
    link: ph('Vuelva al inicio'),
  },
} satisfies Dictionary;
