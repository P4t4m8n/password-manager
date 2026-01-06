import { describe, expect, it } from 'vitest';
import { TimeAgoPipePipe } from '../core/pipes/time-ago-pipe-pipe';

describe('TimeAgoPipePipe', () => {
  it('create an instance', () => {
    const pipe = new TimeAgoPipePipe();
    expect(pipe).toBeTruthy();
  });
});
