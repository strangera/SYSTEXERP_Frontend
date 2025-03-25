import { TestBed } from '@angular/core/testing';

import { PaymentTimingService } from './payment-timing.service';

describe('PaymentTimingService', () => {
  let service: PaymentTimingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentTimingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
