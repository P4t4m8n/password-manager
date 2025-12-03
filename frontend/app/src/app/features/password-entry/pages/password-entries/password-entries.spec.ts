import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect } from 'vitest';

import { PasswordEntries } from './password-entries';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('PasswordEntities', () => {
  let component: PasswordEntries;
  let fixture: ComponentFixture<PasswordEntries>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordEntries],
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

    fixture = TestBed.createComponent(PasswordEntries);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
