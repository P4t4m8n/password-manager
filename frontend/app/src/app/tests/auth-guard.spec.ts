import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';
import { describe, beforeEach, it, expect } from 'vitest';
import { authGuard } from '../features/auth/guards/auth-guard';


describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
