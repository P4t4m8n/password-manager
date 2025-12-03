import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect } from 'vitest';

import { PasswordEntries } from '../features/password-entry/pages/password-entries/password-entries';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { PasswordEntryHttpService } from '../features/password-entry/services/password-entry-http-service';

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
        {
          provide: PasswordEntryHttpService,
          useValue: {
            get: () => of({ data: [] }),
            passwordEntries$: of([]),
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
