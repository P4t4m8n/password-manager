import { TestBed } from '@angular/core/testing';

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
