import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconCheck } from './icon-check';

describe('IconCheck', () => {
  let component: IconCheck;
  let fixture: ComponentFixture<IconCheck>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconCheck]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IconCheck);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
