import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconWarn } from './icon-warn';

describe('IconWarn', () => {
  let component: IconWarn;
  let fixture: ComponentFixture<IconWarn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconWarn]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IconWarn);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
