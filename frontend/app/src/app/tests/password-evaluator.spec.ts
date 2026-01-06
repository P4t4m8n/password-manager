import { TestBed } from '@angular/core/testing';

import { describe, beforeEach, it, expect } from 'vitest';
import { PasswordEvaluatorService } from '../features/crypto/services/password-evaluator-service';

describe('PasswordEvaluator', () => {
  let service: PasswordEvaluatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PasswordEvaluatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
