import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordEntries } from './password-entries';

describe('PasswordEntities', () => {
  let component: PasswordEntries;
  let fixture: ComponentFixture<PasswordEntries>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordEntries]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PasswordEntries);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
