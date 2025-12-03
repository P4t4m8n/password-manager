import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect } from 'vitest';
import { MasterPasswordDialogService } from '../features/master-password/services/master-password-dialog-service';

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
