import { TestBed } from '@angular/core/testing';

import { ThemeService } from '../core/services/theme-service';
import { describe, beforeEach, it, expect } from 'vitest';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
