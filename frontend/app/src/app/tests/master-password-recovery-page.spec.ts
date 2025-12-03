import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect, vi, afterEach } from 'vitest';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { MasterPasswordRecoveryPage } from '../features/master-password/pages/master-password-recovery-page/master-password-recovery-page';

describe('MasterPasswordRecoveryPage', () => {
  let component: MasterPasswordRecoveryPage;
  let fixture: ComponentFixture<MasterPasswordRecoveryPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasterPasswordRecoveryPage],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(MasterPasswordRecoveryPage);
    component = fixture.componentInstance;

    // vi.spyOn(masterPasswordHttpService, 'getMasterPasswordRecovery').mockReturnValue(
    //   of({
    //     encryptedMasterKeyWithRecovery: 'mock-encrypted-key',
    //     recoveryIV: 'mock-iv',
    //   })
    // );

    // fixture.detectChanges();
  });

  // afterEach(() => {
  //   fixture.destroy();
  // });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
