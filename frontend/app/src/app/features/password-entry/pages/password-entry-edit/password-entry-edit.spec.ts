import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordEntryEdit } from './password-entry-edit';

describe('PasswordEntryEdit', () => {
  let component: PasswordEntryEdit;
  let fixture: ComponentFixture<PasswordEntryEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordEntryEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PasswordEntryEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
