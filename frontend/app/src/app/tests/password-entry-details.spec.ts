import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect } from 'vitest';

import { PasswordEntryDetails } from '../features/password-entry/pages/password-entry-details/password-entry-details';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { PasswordEntryHttpService } from '../features/password-entry/services/password-entry-http-service';
import { CryptoService } from '../features/crypto/services/crypto-service';

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
        {
          provide: PasswordEntryHttpService,
          useValue: {
            getById: () => of({}),
            delete: () => of(void 0),
          },
        },
        {
          provide: CryptoService,
          useValue: {
            decryptPassword: () => Promise.resolve('decrypted'),
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
