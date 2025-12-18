import { describe, it, expect } from 'vitest';
import { AbstractGlobalStateService } from '../core/abstracts/abstract-global-state-service.abstract';

describe('AbstractGlobalState', () => {
  it('should create an instance', () => {
    expect(new AbstractGlobalStateService()).toBeTruthy();
  });
});
