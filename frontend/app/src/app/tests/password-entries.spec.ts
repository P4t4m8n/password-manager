import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { PasswordEntries } from '../features/password-entry/pages/password-entries/password-entries';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { PasswordEntryHttpService } from '../features/password-entry/services/password-entry-http-service';
import { IPasswordEntryDto } from '../features/password-entry/interfaces/passwordEntry';
import { IHttpResponseDto } from '../core/interfaces/http-response-dto';

describe('PasswordEntities', () => {
  let component: PasswordEntries;
  let passwordEntryService: Partial<PasswordEntryHttpService>;
  let router: Partial<Router>;
  let queryParamsSubject: BehaviorSubject<{ entryName?: string }>;
  let passwordEntriesSubject: BehaviorSubject<IPasswordEntryDto[]>;

  const mockPasswordEntries: IPasswordEntryDto[] = [
    {
      id: '1',
      entryName: 'Test Entry 1',
      entryUserName: 'user1',
      websiteUrl: 'http://example.com/1',
      notes: 'Some notes 1',
      encryptedPassword: 'new ArrayBuffer(0),',
      iv: 'new ArrayBuffer(0),',
    },
    {
      id: '2',
      entryName: 'Test Entry 2',
      entryUserName: 'user2',
      websiteUrl: 'http://example.com/2',
      notes: 'Some notes 2',
      encryptedPassword: 'new ArrayBuffer(0),',
      iv: 'new ArrayBuffer(0),',
    },
    {
      id: '3',
      entryName: 'Test Entry 3',
      entryUserName: 'user3',
      websiteUrl: 'http://example.com/3',
      notes: 'Some notes 3',
      encryptedPassword: 'new ArrayBuffer(0),',
      iv: 'new ArrayBuffer(0),',
    },
  ];

  beforeEach(async () => {
    queryParamsSubject = new BehaviorSubject<{ entryName?: string }>({});
    passwordEntriesSubject = new BehaviorSubject<IPasswordEntryDto[]>(mockPasswordEntries);

    const mockResponse: IHttpResponseDto<IPasswordEntryDto[]> = {
      data: mockPasswordEntries,
      message: 'Success',
      statusCode: 200,
    };

    passwordEntryService = {
      get: vi.fn(
        (searchParams?: {
          entryName?: string;
        }): Observable<IHttpResponseDto<IPasswordEntryDto[]>> =>
          new Observable((subscriber) => {
            subscriber.next(mockResponse);
            subscriber.complete();
          })
      ),
      passwordEntries$: passwordEntriesSubject.asObservable(),
    };

    router = {
      navigate: vi.fn().mockResolvedValue(true),
    };

    await TestBed.configureTestingModule({
      providers: [
        PasswordEntries,
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: queryParamsSubject.asObservable(),
          },
        },
        {
          provide: Router,
          useValue: router,
        },
        {
          provide: PasswordEntryHttpService,
          useValue: passwordEntryService,
        },
      ],
    }).compileComponents();

    component = TestBed.inject(PasswordEntries);
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call service.get with empty entryName on init', () => {
    expect(passwordEntryService.get).toHaveBeenCalledWith({ entryName: '' });
  });

  it('should call service.get with entryName from query params', async () => {
    queryParamsSubject.next({ entryName: 'Test Entry 1' });
    await vi.waitFor(() => {
      expect(passwordEntryService.get).toHaveBeenCalledWith({ entryName: 'Test Entry 1' });
    });
  });

  it('should update searchControl value when query params change', async () => {
    queryParamsSubject.next({ entryName: 'search term' });
    await vi.waitFor(() => {
      expect(component.searchControl.value).toBe('search term');
    });
  });

  it('should update query params when searchControl value changes', async () => {
    component.searchControl.setValue('new search');

    await vi.waitFor(
      () => {
        expect(router.navigate).toHaveBeenCalledWith([], {
          relativeTo: expect.anything(),
          queryParams: { entryName: 'new search' },
          queryParamsHandling: 'merge',
        });
      },
      { timeout: 500 }
    );
  });

  it('should debounce search input changes', async () => {
    vi.clearAllMocks();

    component.searchControl.setValue('a');
    component.searchControl.setValue('ab');
    component.searchControl.setValue('abc');

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(router.navigate).not.toHaveBeenCalled();

    await vi.waitFor(
      () => {
        expect(router.navigate).toHaveBeenCalledTimes(1);
      },
      { timeout: 500 }
    );
  });

  it('should set entryName to null when search is cleared', async () => {
    component.searchControl.setValue('');

    await vi.waitFor(
      () => {
        expect(router.navigate).toHaveBeenCalledWith([], {
          relativeTo: expect.anything(),
          queryParams: { entryName: null },
          queryParamsHandling: 'merge',
        });
      },
      { timeout: 500 }
    );
  });

  it('should unsubscribe on destroy', () => {
    const unsubscribeSpy = vi.spyOn(component['subscription'], 'unsubscribe');
    component.ngOnDestroy();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });

  it('should expose passwordEntries$ from service', async () => {
    const entries = await firstValueFrom(component.passwordEntries$);
    expect(entries).toEqual(mockPasswordEntries);
  });
});
