import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect } from 'vitest';
import { PasswordGeneratorDialog } from '../features/password-generator/components/password-generator-dialog/password-generator-dialog';


describe('PasswordGeneratorDialog', () => {
  let component: PasswordGeneratorDialog;
  let fixture: ComponentFixture<PasswordGeneratorDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordGeneratorDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PasswordGeneratorDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
