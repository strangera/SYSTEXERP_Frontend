import { TestBed } from '@angular/core/testing';

import { AccountingaccountService } from './accountingaccount.service';

describe('AccountingaccountService', () => {
  let service: AccountingaccountService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccountingaccountService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
