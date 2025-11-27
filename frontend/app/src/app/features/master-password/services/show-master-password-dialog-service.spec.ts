import { TestBed } from '@angular/core/testing';

import { ShowMasterPasswordDialogService } from './show-master-password-dialog-service';

describe('ShowMasterPasswordDialogService', () => {
  let service: ShowMasterPasswordDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShowMasterPasswordDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
