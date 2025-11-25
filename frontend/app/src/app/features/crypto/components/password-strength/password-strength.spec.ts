import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordStrength } from './password-strength';

describe('PasswordStrength', () => {
  let component: PasswordStrength;
  let fixture: ComponentFixture<PasswordStrength>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordStrength]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PasswordStrength);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
