import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfterSignupIndex } from './after-signup-index';

describe('AfterSignupIndex', () => {
  let component: AfterSignupIndex;
  let fixture: ComponentFixture<AfterSignupIndex>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfterSignupIndex]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AfterSignupIndex);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
