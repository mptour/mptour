import { describe, expect, it } from 'vitest';
import { MAP_GAP, MAP_HIT, mapPinLayout, mapPoints, tourAnchors } from '../src/data/region-map';

describe('region map geometry', () => {
  it('covers every tour and keeps 44px targets apart on a narrow stage', () => {
    expect(mapPoints.map((pin) => pin.image).sort()).toEqual(Object.keys(tourAnchors).sort());

    for (const width of [280, 320]) {
      const layout = mapPinLayout(width);
      expect(layout.minPair, `pair gap at ${width}px`).toBeGreaterThanOrEqual(MAP_HIT + MAP_GAP);
      expect(layout.minInset, `edge inset at ${width}px`).toBeGreaterThanOrEqual(MAP_GAP);
    }
  });
});
