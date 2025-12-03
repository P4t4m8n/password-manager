import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect } from 'vitest';

import { FetchingErrorDialogService } from './fetching-error-dialog-service';

describe('FetchingErrorDialogService', () => {
  let service: FetchingErrorDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FetchingErrorDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
