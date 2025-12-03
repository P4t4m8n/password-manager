import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect } from 'vitest';
import { PasswordGeneratorPage } from '../features/password-generator/pages/password-generator-page/password-generator-page';


describe('PasswordGeneratorPage', () => {
  let component: PasswordGeneratorPage;
  let fixture: ComponentFixture<PasswordGeneratorPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordGeneratorPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PasswordGeneratorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
