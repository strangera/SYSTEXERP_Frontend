import { TestBed } from '@angular/core/testing';

import { CashierCodeService } from './ECRNo.service';

describe('CashierCodeService', () => {
  let service: CashierCodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CashierCodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
