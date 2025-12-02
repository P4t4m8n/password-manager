import { TestBed } from '@angular/core/testing';

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
