import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordEntryPreviewActions } from './password-entry-preview-actions';

describe('PasswordEntryPreviewActions', () => {
  let component: PasswordEntryPreviewActions;
  let fixture: ComponentFixture<PasswordEntryPreviewActions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordEntryPreviewActions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PasswordEntryPreviewActions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
