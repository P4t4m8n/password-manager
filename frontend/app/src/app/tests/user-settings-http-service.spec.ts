import { TestBed } from '@angular/core/testing';

import { UserSettingsHttpService } from '../features/settings/services/user-settings-http-service';
import { describe, beforeEach, it, expect } from 'vitest';

describe('UserSettingsHttpService', () => {
  let service: UserSettingsHttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserSettingsHttpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
