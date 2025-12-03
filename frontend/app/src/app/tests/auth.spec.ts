import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect } from 'vitest';

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from '../features/auth/services/auth.service';
import { CryptoService } from '../features/crypto/services/crypto.service';
import { MasterPasswordSaltSessionService } from '../features/master-password/services/master-password-salt-session-service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: CryptoService,
          useValue: {},
        },
        {
          provide: MasterPasswordSaltSessionService,
          useValue: {
            masterPasswordSalt: null,
          },
        },
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should sign in user', () => {
    const mockResponse = {
      data: {
        user: { id: 1, email: 'test@test.com', username: 'test' },
        masterPasswordSalt: 'salt123',
      },
      message: 'Success',
      statusCode: 200,
    };

    service.signIn({ email: 'test@test.com', password: 'pass123' }).subscribe((response) => {
      expect(response.data.user?.email).toBe('test@test.com');
      expect(response.data.masterPasswordSalt).toBe('salt123');
    });

    const req = httpMock.expectOne('http://localhost:5222/api/auth/Sign-in');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });
});
