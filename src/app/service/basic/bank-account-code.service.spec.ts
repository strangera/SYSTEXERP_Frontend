import { TestBed } from '@angular/core/testing';

import { BankAccountCodeService } from './bank-account-code.service';

describe('BankAccountCodeService', () => {
  let service: BankAccountCodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BankAccountCodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
