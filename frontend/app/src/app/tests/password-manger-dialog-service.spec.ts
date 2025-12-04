import { TestBed } from '@angular/core/testing';

import { PasswordMangerDialogService } from '../features/password-generator/services/password-generator-dialog-service';

describe('PasswordMangerDialogService', () => {
  let service: PasswordMangerDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PasswordMangerDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
