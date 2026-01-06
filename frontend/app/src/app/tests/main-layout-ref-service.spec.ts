import { TestBed } from '@angular/core/testing';

import { MainLayoutRefService } from '../core/services/main-layout-ref-service';

describe('LayoutService', () => {
  let service: MainLayoutRefService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MainLayoutRefService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
