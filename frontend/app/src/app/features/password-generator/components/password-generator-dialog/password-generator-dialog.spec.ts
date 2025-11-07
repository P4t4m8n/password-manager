import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordGeneratorDialog } from './password-generator-dialog';

describe('PasswordGeneratorDialog', () => {
  let component: PasswordGeneratorDialog;
  let fixture: ComponentFixture<PasswordGeneratorDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordGeneratorDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PasswordGeneratorDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
