import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should sign in user', () => {
    const mockResponse = {
      user: { id: 1, email: 'test@test.com', username: 'test' },
      masterPasswordSalt: 'salt123',
    };

    service.signIn({ email: 'test@test.com', password: 'pass123' }).subscribe((response) => {
      expect(response.data.user?.email).toBe('test@test.com');
      expect(response.data.masterPasswordSalt).toBe('salt123');
    });

    const req = httpMock.expectOne('api/auth/signin');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });
});
