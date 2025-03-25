import { TestBed } from '@angular/core/testing';

import { TicketPaymentService } from './ticket-payment.service';

describe('TicketPaymentService', () => {
  let service: TicketPaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TicketPaymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
