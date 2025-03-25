import { TestBed } from '@angular/core/testing';

import { PaymentToolService } from './payment-tool.service';

describe('PaymentToolService', () => {
  let service: PaymentToolService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentToolService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
