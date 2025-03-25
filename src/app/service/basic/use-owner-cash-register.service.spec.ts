import { TestBed } from '@angular/core/testing';

import { UseOwnerCashRegisterService } from './use-owner-cash-register.service';

describe('UseOwnerCashRegisterService', () => {
  let service: UseOwnerCashRegisterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UseOwnerCashRegisterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
