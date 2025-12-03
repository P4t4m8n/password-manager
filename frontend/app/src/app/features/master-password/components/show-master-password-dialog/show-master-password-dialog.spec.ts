import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect } from 'vitest';

import { ShowMasterPasswordDialog } from './show-master-password-dialog';

describe('ShowMasterPasswordDialog', () => {
  let component: ShowMasterPasswordDialog;
  let fixture: ComponentFixture<ShowMasterPasswordDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowMasterPasswordDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowMasterPasswordDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
