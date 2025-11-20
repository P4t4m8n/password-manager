import { TestBed } from '@angular/core/testing';

import { PasswordEntityService } from './password-entity-service';

describe('PasswordEntityService', () => {
  let service: PasswordEntityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PasswordEntityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
