import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordEntriesFavorites } from '../features/password-entry/pages/password-entries-favorites/password-entries-favorites';
import { describe, beforeEach, it, expect } from 'vitest';

describe('PasswordEntriesFavorites', () => {
  let component: PasswordEntriesFavorites;
  let fixture: ComponentFixture<PasswordEntriesFavorites>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordEntriesFavorites],
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordEntriesFavorites);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
