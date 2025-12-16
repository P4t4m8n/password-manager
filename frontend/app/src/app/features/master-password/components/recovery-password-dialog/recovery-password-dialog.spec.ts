import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecoveryPasswordDialog } from './recovery-password-dialog';

describe('RecoveryPasswordDialog', () => {
  let component: RecoveryPasswordDialog;
  let fixture: ComponentFixture<RecoveryPasswordDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecoveryPasswordDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecoveryPasswordDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
