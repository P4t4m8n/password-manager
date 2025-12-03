import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect } from 'vitest';

import { PasswordEntryDetails } from './password-entry-details';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('PasswordEntryDetails', () => {
  let component: PasswordEntryDetails;
  let fixture: ComponentFixture<PasswordEntryDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordEntryDetails],
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

    fixture = TestBed.createComponent(PasswordEntryDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
