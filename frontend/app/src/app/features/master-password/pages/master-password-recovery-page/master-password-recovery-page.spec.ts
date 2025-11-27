import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterPasswordRecoveryPage } from './master-password-recovery-page';

describe('MasterPasswordRecoveryPage', () => {
  let component: MasterPasswordRecoveryPage;
  let fixture: ComponentFixture<MasterPasswordRecoveryPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasterPasswordRecoveryPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MasterPasswordRecoveryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
