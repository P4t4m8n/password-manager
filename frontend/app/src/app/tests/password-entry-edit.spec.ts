import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect } from 'vitest';

import { PasswordEntryEdit } from '../features/password-entry/pages/password-entry-edit/password-entry-edit';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { PasswordEntryHttpService } from '../features/password-entry/services/password-entry-http-service';
import { CryptoService } from '../features/crypto/services/crypto-service';

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
        {
          provide: PasswordEntryHttpService,
          useValue: {
            getById: () => of({}),
            save: () => of({}),
          },
        },
        {
          provide: CryptoService,
          useValue: {
            decryptPassword: () => Promise.resolve('decrypted'),
            encryptPassword: () =>
              Promise.resolve({
                encrypted: new ArrayBuffer(0),
                iv: new ArrayBuffer(0),
              }),
            arrayBufferToBase64: () => 'base64',
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
