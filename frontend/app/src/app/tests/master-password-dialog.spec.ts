import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect } from 'vitest';
import { MasterPasswordDialog } from '../features/master-password/components/master-password-dialog/master-password-dialog';


describe('MasterPasswordDialog', () => {
  let component: MasterPasswordDialog;
  let fixture: ComponentFixture<MasterPasswordDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasterPasswordDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MasterPasswordDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
