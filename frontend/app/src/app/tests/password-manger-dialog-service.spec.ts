import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { PasswordGeneratorDialogService } from '../features/password-generator/services/password-generator-dialog-service';

describe('PasswordGeneratorDialogService', () => {
  let service: PasswordGeneratorDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PasswordGeneratorDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
