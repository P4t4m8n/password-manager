import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconActions } from './icon-actions';

describe('IconActions', () => {
  let component: IconActions;
  let fixture: ComponentFixture<IconActions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconActions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IconActions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
