import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FetchingErrorDialog } from './fetching-error-dialog';

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
