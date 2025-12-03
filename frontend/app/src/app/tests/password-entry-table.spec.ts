import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect } from 'vitest';
import { PasswordEntryTable } from '../features/password-entry/components/password-entry-table/password-entry-table';


describe('PasswordEntryTable', () => {
  let component: PasswordEntryTable;
  let fixture: ComponentFixture<PasswordEntryTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordEntryTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PasswordEntryTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
