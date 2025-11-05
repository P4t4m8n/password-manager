import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthIndex } from './auth-index';

describe('AuthIndex', () => {
  let component: AuthIndex;
  let fixture: ComponentFixture<AuthIndex>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthIndex]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthIndex);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
