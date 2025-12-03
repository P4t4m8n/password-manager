import { TestBed } from '@angular/core/testing';
import { describe, it, expect } from 'vitest';
import { SwipeMenuDirective } from '../core/layout/side-menu/directives/swipe-menu-directive';

describe('SwipeMenuDirective', () => {
  it('should create an instance', () => {
    TestBed.configureTestingModule({});
    const directive = TestBed.runInInjectionContext(() => new SwipeMenuDirective());
    expect(directive).toBeTruthy();
  });
});
