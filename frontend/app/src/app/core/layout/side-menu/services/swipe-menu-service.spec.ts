import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect } from 'vitest';

import { SwipeMenuService } from './swipe-menu-service';

describe('SwipeMenuService', () => {
  let service: SwipeMenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SwipeMenuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
