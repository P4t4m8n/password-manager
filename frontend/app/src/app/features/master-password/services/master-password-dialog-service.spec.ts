import { TestBed } from '@angular/core/testing';

import { MasterPasswordDialogService } from './master-password-dialog-service';

describe('MasterPasswordDialogService', () => {
  let service: MasterPasswordDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MasterPasswordDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
