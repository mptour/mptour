import type { TerritoryImage } from '../i18n/mark';

/** Square stage. Pin percentages use the same box as the SVG viewBox. */
export const MAP_VIEWBOX = { width: 1000, height: 1000 } as const;

/** Minimum hit target and the gap required between targets on a narrow screen. */
export const MAP_HIT = 44;
export const MAP_GAP = 8;

export const tourAnchors = {
  'falls-br': 'cataratas-brasil',
  'falls-ar': 'cataratas-argentina',
  itaipu: 'itaipu',
  paraguay: 'paraguai',
  frontier: 'tres-fronteiras',
} as const satisfies Record<TerritoryImage, string>;

export function cardId(image: TerritoryImage): string {
  return `mapa-${tourAnchors[image]}`;
}

export type LabelSide = 'start' | 'end' | 'top' | 'bottom';
export type MapLand = 'br' | 'ar' | 'py';

export interface MapPoint {
  image: TerritoryImage;
  /** Percent of the stage, matching the viewBox. */
  x: number;
  y: number;
  labelSide: LabelSide;
  land: MapLand;
}

/**
 * North to south, the order of keyboard and screen-reader traversal.
 * Positions are illustrative, not a survey: the falls sit far enough apart to tap.
 */
export const mapPoints = [
  { image: 'itaipu', x: 47, y: 26, labelSide: 'end', land: 'br' },
  { image: 'paraguay', x: 18, y: 40, labelSide: 'bottom', land: 'py' },
  { image: 'frontier', x: 44, y: 52, labelSide: 'end', land: 'br' },
  { image: 'falls-br', x: 74, y: 63, labelSide: 'top', land: 'br' },
  { image: 'falls-ar', x: 58, y: 78, labelSide: 'bottom', land: 'ar' },
] as const satisfies readonly MapPoint[];

export const countryLabels = [
  { land: 'br', x: 56, y: 34, align: 'start' },
  { land: 'py', x: 6, y: 70, align: 'start' },
  { land: 'ar', x: 94, y: 91, align: 'end' },
] as const satisfies readonly { land: MapLand; x: number; y: number; align: 'start' | 'end' }[];

/** Center distance and how far each hit box sits inside a square stage. */
export function mapPinLayout(stageWidth: number) {
  const radius = MAP_HIT / 2;
  const points = mapPoints.map((pin) => ({
    image: pin.image,
    x: (pin.x / 100) * stageWidth,
    y: (pin.y / 100) * stageWidth,
  }));
  let minPair = Number.POSITIVE_INFINITY;
  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      const dx = points[i].x - points[j].x;
      const dy = points[i].y - points[j].y;
      minPair = Math.min(minPair, Math.hypot(dx, dy));
    }
  }
  let minInset = Number.POSITIVE_INFINITY;
  for (const pin of points) {
    minInset = Math.min(
      minInset,
      pin.x - radius,
      pin.y - radius,
      stageWidth - pin.x - radius,
      stageWidth - pin.y - radius,
    );
  }
  return { minPair, minInset };
}
