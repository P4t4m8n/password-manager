import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterPasswordDialog } from './master-password-dialog';

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
