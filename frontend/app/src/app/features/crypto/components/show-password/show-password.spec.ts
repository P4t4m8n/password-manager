import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowPassword } from './show-password';

describe('ShowPassword', () => {
  let component: ShowPassword;
  let fixture: ComponentFixture<ShowPassword>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowPassword]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowPassword);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
