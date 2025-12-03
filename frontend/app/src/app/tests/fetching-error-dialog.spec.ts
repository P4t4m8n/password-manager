import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect } from 'vitest';

import { FetchingErrorDialog } from '../core/fetching-error-dialog/components/fetching-error-dialog/fetching-error-dialog';

describe('FetchingErrorDialog', () => {
  let component: FetchingErrorDialog;
  let fixture: ComponentFixture<FetchingErrorDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FetchingErrorDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FetchingErrorDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
