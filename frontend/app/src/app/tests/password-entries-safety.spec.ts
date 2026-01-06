import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordEntriesSafety } from '../features/password-entry/components/password-entries-safety/password-entries-safety';
import { describe, beforeEach, it, expect } from 'vitest';

describe('PasswordEntriesSafety', () => {
  let component: PasswordEntriesSafety;
  let fixture: ComponentFixture<PasswordEntriesSafety>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordEntriesSafety]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PasswordEntriesSafety);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
