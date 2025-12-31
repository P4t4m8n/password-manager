import { describe, it, expect } from 'vitest';
import { ExtendedTitleCasePipePipe } from '../core/pipes/extended-title-case-pipe-pipe';

describe('ExtendedTitleCasePipePipe', () => {
  it('create an instance', () => {
    const pipe = new ExtendedTitleCasePipePipe();
    expect(pipe).toBeTruthy();
  });
});
