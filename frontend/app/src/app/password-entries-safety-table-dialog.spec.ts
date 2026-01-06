import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect } from 'vitest';
import { PasswordEntriesSafetyTableDialog } from './features/password-entry/services/password-entries-safety-table-dialog-service';


describe('PasswordEntriesSafetyTableDialog', () => {
  let service: PasswordEntriesSafetyTableDialog;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PasswordEntriesSafetyTableDialog);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
