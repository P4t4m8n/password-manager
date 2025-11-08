import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconShield } from './icon-shield';

describe('IconShield', () => {
  let component: IconShield;
  let fixture: ComponentFixture<IconShield>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconShield]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IconShield);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
