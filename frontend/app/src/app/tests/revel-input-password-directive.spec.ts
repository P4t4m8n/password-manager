import { RevelInputPasswordDirective } from '../core/directives/revel-input-password-directive';
import { describe, beforeEach, it, expect } from 'vitest';

describe('RevelInputPasswordDirective', () => {
  it('should create an instance', () => {
    const directive = new RevelInputPasswordDirective();
    expect(directive).toBeTruthy();
  });
});
