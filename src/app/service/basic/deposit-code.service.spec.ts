import { TestBed } from '@angular/core/testing';

import { DepositCodeService } from './deposit-code.service';

describe('DepositCodeService', () => {
  let service: DepositCodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DepositCodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
