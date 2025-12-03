import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect } from 'vitest';

import { PasswordEntryPreviewActions } from './password-entry-preview-actions';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('PasswordEntryPreviewActions', () => {
  let component: PasswordEntryPreviewActions;
  let fixture: ComponentFixture<PasswordEntryPreviewActions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordEntryPreviewActions],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({}),
            queryParams: of({}),
            snapshot: { params: {}, queryParams: {} },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordEntryPreviewActions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
