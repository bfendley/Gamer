import { describe, expect, it } from 'vitest';
import { OreoDog } from '../OreoDog';

describe('OreoDog model', () => {
  it('has the expected parts attached', () => {
    const oreo = new OreoDog();
    expect(oreo.children.length).toBeGreaterThan(6);
  });

  it('responds to wagTail without throwing', () => {
    const oreo = new OreoDog();
    expect(() => oreo.wagTail(0.16)).not.toThrow();
  });
});
