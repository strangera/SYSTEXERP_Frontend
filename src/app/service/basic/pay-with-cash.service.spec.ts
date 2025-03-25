import { TestBed } from '@angular/core/testing';

import { PayWithCashService } from './pay-with-cash.service';

describe('PayWithCashService', () => {
  let service: PayWithCashService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PayWithCashService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
