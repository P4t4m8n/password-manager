import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect } from 'vitest';

import { MasterPasswordRecoveryService } from './master-password-recovery-service';

describe('MasterPasswordRecoveryService', () => {
  let service: MasterPasswordRecoveryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MasterPasswordRecoveryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
