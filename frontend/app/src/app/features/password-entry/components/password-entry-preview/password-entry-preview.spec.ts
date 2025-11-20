import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordEntryPreview } from './password-entry-preview';

describe('PasswordEntryPreview', () => {
  let component: PasswordEntryPreview;
  let fixture: ComponentFixture<PasswordEntryPreview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordEntryPreview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PasswordEntryPreview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
