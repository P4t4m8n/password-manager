import { TestBed } from '@angular/core/testing';

import { UserSettingsStateService } from '../features/settings/services/user-settings-state-service';
import { describe, beforeEach, it, expect } from 'vitest';

describe('UserSettingsState', () => {
  let service: UserSettingsStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserSettingsStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
