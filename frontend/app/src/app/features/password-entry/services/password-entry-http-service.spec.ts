import { TestBed } from '@angular/core/testing';
import { PasswordEntryHttpService } from './password-entry-http-service';

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
