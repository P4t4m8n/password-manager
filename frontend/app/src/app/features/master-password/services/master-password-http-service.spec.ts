import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect } from 'vitest';

import { MasterPasswordHttpService } from './master-password-http-service';

describe('MasterPasswordHttpService', () => {
  let service: MasterPasswordHttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MasterPasswordHttpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
