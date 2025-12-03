import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect } from 'vitest';
import { PasswordEntryHttpService } from '../features/password-entry/services/password-entry-http-service';

describe('PasswordEntryHttpService', () => {
  let service: PasswordEntryHttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PasswordEntryHttpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
