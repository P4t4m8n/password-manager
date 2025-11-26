import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordGeneratorPage } from './password-generator-page';

describe('PasswordGeneratorPage', () => {
  let component: PasswordGeneratorPage;
  let fixture: ComponentFixture<PasswordGeneratorPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordGeneratorPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PasswordGeneratorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
