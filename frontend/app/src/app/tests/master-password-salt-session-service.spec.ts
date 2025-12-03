import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect } from 'vitest';
import { MasterPasswordSaltSessionService } from '../features/master-password/services/master-password-salt-session-service';

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
