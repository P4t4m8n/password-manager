import { TestBed } from '@angular/core/testing';
import { CryptoService } from './crypto.service';
import { provideZonelessChangeDetection } from '@angular/core';
import { describe, beforeEach, it, expect } from 'vitest';

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    service = TestBed.inject(CryptoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
