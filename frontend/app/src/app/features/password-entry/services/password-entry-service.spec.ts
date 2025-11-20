import { TestBed } from '@angular/core/testing';

import { PasswordEntryService } from './password-entry-service';

describe('PasswordEntryService', () => {
  let service: PasswordEntryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PasswordEntryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
