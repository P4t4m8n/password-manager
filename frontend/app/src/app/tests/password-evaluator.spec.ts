import { TestBed } from '@angular/core/testing';

import { describe, beforeEach, it, expect } from 'vitest';
import { PasswordEvaluator } from '../features/crypto/services/password-evaluator.service';

describe('PasswordEvaluator', () => {
  let service: PasswordEvaluator;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PasswordEvaluator);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
