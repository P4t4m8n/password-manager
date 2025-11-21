import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconDots } from './icon-dots';

describe('IconDots', () => {
  let component: IconDots;
  let fixture: ComponentFixture<IconDots>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconDots]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IconDots);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
