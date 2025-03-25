import { TestBed } from '@angular/core/testing';

import { PaymentMethod2Service } from './payment-method2.service';

describe('PaymentMethod2Service', () => {
  let service: PaymentMethod2Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentMethod2Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
