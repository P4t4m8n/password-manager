import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitButton } from '../core/components/submit-button/submit-button';
import { describe, beforeEach, it, expect } from 'vitest';

describe('SubmitButton', () => {
  let component: SubmitButton;
  let fixture: ComponentFixture<SubmitButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmitButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmitButton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
