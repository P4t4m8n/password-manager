import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconFavorite } from './icon-favorite';

describe('IconFavorite', () => {
  let component: IconFavorite;
  let fixture: ComponentFixture<IconFavorite>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconFavorite]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IconFavorite);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
