import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconOpenExternal } from './icon-open-external';

describe('IconOpenExternal', () => {
  let component: IconOpenExternal;
  let fixture: ComponentFixture<IconOpenExternal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconOpenExternal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IconOpenExternal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
