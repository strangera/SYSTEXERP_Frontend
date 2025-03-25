import { TestBed } from '@angular/core/testing';

import { PaymentFailStatusService } from './payment-fail-status.service';

describe('PaymentFailStatusService', () => {
  let service: PaymentFailStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentFailStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
