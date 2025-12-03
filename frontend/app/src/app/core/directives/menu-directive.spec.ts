import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuDirective } from './menu-directive';
import { describe, it, expect, beforeEach } from 'vitest';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

@Component({
  template: '<div menu></div>',
  imports: [MenuDirective],
})
class TestComponent {}

describe('MenuDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let directiveElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent, MenuDirective],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    directiveElement = fixture.debugElement.query(By.directive(MenuDirective));
    fixture.detectChanges();
  });

  it('should create an instance', () => {
    expect(directiveElement).toBeTruthy();
    const directive = directiveElement.injector.get(MenuDirective);
    expect(directive).toBeTruthy();
  });
});
