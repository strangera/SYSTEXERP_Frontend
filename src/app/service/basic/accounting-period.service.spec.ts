import { TestBed } from '@angular/core/testing';

import { AccountingPeriodService } from './accounting-period.service';

describe('AccountingPeriodService', () => {
  let service: AccountingPeriodService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccountingPeriodService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
