import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconError } from './icon-error';

describe('IconError', () => {
  let component: IconError;
  let fixture: ComponentFixture<IconError>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconError]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IconError);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
