import { describe, expect, it } from 'vitest';
import { chrome, en, es, notices, pt } from '../src/i18n';
import { isCopy } from '../src/i18n/mark';

const imageIds = new Set([
  'falls-br',
  'falls-ar',
  'itaipu',
  'paraguay',
  'frontier',
  'exp-san-martin',
  'exp-walkway',
  'exp-itaipu',
  'exp-bridge',
  'exp-curtain',
]);

function assertMarked(value: unknown, path: string) {
  if (typeof value === 'string') {
    expect(imageIds.has(value), `${path} is an unmarked string`).toBe(true);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertMarked(item, `${path}[${index}]`));
    return;
  }
  if (isCopy(value)) return;
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) assertMarked(child, `${path}.${key}`);
  }
}

describe('copy', () => {
  it('marks every Portuguese string and leaves ES/EN marketing empty', () => {
    assertMarked(pt, 'pt');
    assertMarked(chrome, 'chrome');
    assertMarked(notices, 'notices');
    expect(es).toEqual({});
    expect(en).toEqual({});
  });
});
