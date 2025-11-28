import { TestBed } from '@angular/core/testing';

import { MasterPasswordService } from './master-password-service';

describe('MasterPasswordService', () => {
  let service: MasterPasswordService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MasterPasswordService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
