export interface Credit {
  subject: string;
  author: string;
  license: string;
  href: string;
  kind?: 'photo' | 'video';
}

/** Provisional photographs. Not MPTour assets. One entry per file on the home. */
export const IMAGE_CREDITS: readonly Credit[] = [
  {
    subject: 'Garganta do Diabo',
    author: 'P. Hughes',
    license: 'CC BY 4.0',
    href: 'https://commons.wikimedia.org/wiki/File:Iguazu_Falls_-_Devil%27s_Throat.jpg',
  },
  {
    subject: 'Passarela brasileira',
    author: 'Murray Foubister',
    license: 'CC BY-SA 2.0',
    href: 'https://commons.wikimedia.org/wiki/File:Iguassu_Falls,_Brazil-Argentina_-_walkway_to_the_top_of_the_falls_on_the_Brazilian_side_-_(24748952481).jpg',
  },
  {
    subject: 'Salto San Martín',
    author: 'Falk2',
    license: 'CC BY-SA 4.0',
    href: 'https://commons.wikimedia.org/wiki/File:J31_097_Salto_San_Mart%C3%ADn_bis_Adan.jpg',
  },
  {
    subject: 'Itaipu',
    author: 'Jonas de Carvalho',
    license: 'CC BY-SA 2.0',
    href: 'https://commons.wikimedia.org/wiki/File:Itaipu_geral.jpg',
  },
  {
    subject: 'Ponte da Amizade',
    author: 'Rodrigo Yoshioka',
    license: 'CC BY 2.0',
    href: 'https://commons.wikimedia.org/wiki/File:Ponte_da_Amizade_in_Foz_do_Iguacu.jpg',
  },
  {
    subject: 'Três Fronteiras',
    author: 'Horacio Cambeiro',
    license: 'CC BY 4.0',
    href: 'https://commons.wikimedia.org/wiki/File:Triple_frontera_monument_(Argentina)_%C2%B7_Hito_Tres_Fronteras_(Puerto_Iguaz%C3%BA,_Argentina).jpg',
  },
  {
    subject: 'Borda do San Martín',
    author: 'Falk2',
    license: 'CC BY-SA 4.0',
    href: 'https://commons.wikimedia.org/wiki/File:J37_932_Salto_San_Mart%C3%ADn_(Richtung_Salto_Floriano).jpg',
  },
  {
    subject: 'Passarela sobre a queda',
    author: 'Murray Foubister',
    license: 'CC BY-SA 2.0',
    href: 'https://commons.wikimedia.org/wiki/File:Iguassu_Falls,_Brazil-Argentina_-_spectacular_walkways_-_(24216417843).jpg',
  },
  {
    subject: 'Vertedouro de Itaipu',
    author: 'Cmasi',
    license: 'CC BY-SA 4.0',
    href: 'https://commons.wikimedia.org/wiki/File:Itaipu_Dam_4084_filtered_(1).jpg',
  },
  {
    subject: 'Ponte, lado paraguaio',
    author: 'Ekem',
    license: 'CC BY-SA 3.0',
    href: 'https://commons.wikimedia.org/wiki/File:Ciudad_del_Este_puente_de_la_Amistad.jpg',
  },
  {
    subject: 'Cortina da Garganta',
    author: 'Josep M. Gracia',
    license: 'CC BY-SA 4.0',
    href: 'https://commons.wikimedia.org/wiki/File:IG_-_Detail_of_Devil%27s_Throat_from_the_Brazilian_side_of_Iguazu_Falls,_2023.jpg',
  },
];

/**
 * Sources cut into the hero montage. Itaipu and the Marco are Pexels stills:
 * no free video of those places was on Pexels, Pixabay, or Mixkit.
 */
export const VIDEO_CREDITS: readonly Credit[] = [
  {
    kind: 'video',
    subject: 'Cataratas do Iguaçu',
    author: 'Mixkit',
    license: 'Mixkit Stock Video Free License',
    href: 'https://mixkit.co/free-stock-video/iguazu-falls-landscape-11060/',
  },
  {
    kind: 'photo',
    subject: 'Itaipu (foto no clipe)',
    author: 'Daniel Emmerick',
    license: 'Pexels License',
    href: 'https://www.pexels.com/photo/itaipu-dam-on-parana-river-19905690/',
  },
  {
    kind: 'photo',
    subject: 'Marco das Três Fronteiras (foto no clipe)',
    author: 'João Saplak',
    license: 'Pexels License',
    href: 'https://www.pexels.com/photo/directional-signs-for-marco-das-tres-fronteiras-19240302/',
  },
];
