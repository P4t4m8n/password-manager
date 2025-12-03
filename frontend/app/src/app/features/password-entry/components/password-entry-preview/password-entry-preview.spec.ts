import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect } from 'vitest';

import { PasswordEntryPreview } from './password-entry-preview';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { IPasswordEntryDto } from '../../interfaces/passwordEntry';

describe('PasswordEntryPreview', () => {
  let component: PasswordEntryPreview;
  let fixture: ComponentFixture<PasswordEntryPreview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordEntryPreview],
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

    fixture = TestBed.createComponent(PasswordEntryPreview);
    component = fixture.componentInstance;
    const mockEntry: IPasswordEntryDto = {
      id: '1',
      entryName: 'Test Entry',
      websiteUrl: 'https://test.com',
      entryUserName: 'test-user',
      encryptedPassword: 'encrypted',
      iv: 'iv',
    };
    component.entry = mockEntry;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
