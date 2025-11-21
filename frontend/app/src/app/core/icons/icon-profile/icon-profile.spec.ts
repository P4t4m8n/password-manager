import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconProfile } from './icon-profile';

describe('IconProfile', () => {
  let component: IconProfile;
  let fixture: ComponentFixture<IconProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconProfile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IconProfile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
