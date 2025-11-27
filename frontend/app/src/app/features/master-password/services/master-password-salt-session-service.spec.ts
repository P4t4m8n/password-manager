import { TestBed } from '@angular/core/testing';
import { MasterPasswordSaltSessionService } from './master-password-salt-session-service';

describe('MasterPasswordSaltSessionService', () => {
  let service: MasterPasswordSaltSessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MasterPasswordSaltSessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
