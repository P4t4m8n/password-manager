import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect } from 'vitest';
import { ShowMasterPasswordDialogService } from '../features/master-password/services/show-master-password-dialog-service';


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
