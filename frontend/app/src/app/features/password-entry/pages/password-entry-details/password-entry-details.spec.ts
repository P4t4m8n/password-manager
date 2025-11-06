import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordEntryDetails } from './password-entry-details';

describe('PasswordEntryDetails', () => {
  let component: PasswordEntryDetails;
  let fixture: ComponentFixture<PasswordEntryDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordEntryDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PasswordEntryDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
