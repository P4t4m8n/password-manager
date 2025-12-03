import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect } from 'vitest';
import { LocalSessionStorageService } from '../core/services/local-session-storage-service';

describe('LocalSessionStorageService', () => {
  let service: LocalSessionStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalSessionStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
