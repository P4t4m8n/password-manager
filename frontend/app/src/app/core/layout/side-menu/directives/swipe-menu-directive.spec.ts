import { TestBed } from '@angular/core/testing';
import { SwipeMenuDirective } from './swipe-menu-directive';
import { describe, it, expect } from 'vitest';

describe('SwipeMenuDirective', () => {
  it('should create an instance', () => {
    TestBed.configureTestingModule({});
    const directive = TestBed.runInInjectionContext(() => new SwipeMenuDirective());
    expect(directive).toBeTruthy();
  });
});
