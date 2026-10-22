export type Copy = {
  readonly text: string;
  readonly placeholder: true;
};

/** Marks draft copy. WhatsApp messages do not go through here. */
export function ph(text: string): Copy {
  return { text, placeholder: true };
}

export function isCopy(value: unknown): value is Copy {
  return (
    !!value &&
    typeof value === 'object' &&
    'text' in value &&
    'placeholder' in value &&
    (value as Copy).placeholder === true &&
    typeof (value as Copy).text === 'string'
  );
}

export type TerritoryImage = 'falls-br' | 'falls-ar' | 'itaipu' | 'paraguay' | 'frontier';

export interface Territory {
  name: Copy;
  place: Copy;
  text: Copy;
  image: TerritoryImage;
}

export interface MapPointCopy {
  image: TerritoryImage;
  name: Copy;
  label: Copy;
}

export interface Experience {
  title: Copy;
  territory: Copy;
  duration: Copy;
  image: 'exp-san-martin' | 'exp-walkway' | 'exp-itaipu' | 'exp-bridge' | 'exp-curtain';
}

export interface Dictionary {
  meta: { title: Copy; description: Copy };
  nav: { territories: Copy; experiences: Copy; method: Copy; cta: Copy };
  hero: {
    eyebrow: Copy;
    titleLead: Copy;
    titleEm: Copy;
    lede: Copy;
    cta: Copy;
    secondary: Copy;
  };
  manifesto: { kicker: Copy; quote: Copy; facts: Copy[] };
  territories: { kicker: Copy; title: Copy; lede: Copy; items: Territory[] };
  regionMap: {
    title: Copy;
    idleMeta: Copy;
    idleTitle: Copy;
    idleText: Copy;
    link: Copy;
    countries: { br: Copy; ar: Copy; py: Copy };
    points: MapPointCopy[];
  };
  experiences: { kicker: Copy; title: Copy; lede: Copy; items: Experience[] };
  method: {
    kicker: Copy;
    title: Copy;
    steps: { title: Copy; text: Copy }[];
  };
  plan: { kicker: Copy; title: Copy; text: Copy; cta: Copy; note: Copy };
  footer: { place: Copy; legal: Copy; credits: Copy };
  credits: { title: Copy; lede: Copy };
  missing: { kicker: Copy; title: Copy; text: Copy; link: Copy };
}
