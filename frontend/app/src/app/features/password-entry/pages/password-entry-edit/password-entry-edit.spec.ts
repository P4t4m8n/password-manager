import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect } from 'vitest';

import { PasswordEntryEdit } from './password-entry-edit';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('PasswordEntryEdit', () => {
  let component: PasswordEntryEdit;
  let fixture: ComponentFixture<PasswordEntryEdit>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordEntryEdit],
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

    fixture = TestBed.createComponent(PasswordEntryEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
