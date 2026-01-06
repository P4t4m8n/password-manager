import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordEntriesSafetyTableDialog } from '../features/password-entry/components/password-entries-safety-table-dialog/password-entries-safety-table-dialog';
import { describe, beforeEach, it, expect } from 'vitest';

describe('PasswordEntriesSafetyTableDialog', () => {
  let component: PasswordEntriesSafetyTableDialog;
  let fixture: ComponentFixture<PasswordEntriesSafetyTableDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordEntriesSafetyTableDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PasswordEntriesSafetyTableDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
