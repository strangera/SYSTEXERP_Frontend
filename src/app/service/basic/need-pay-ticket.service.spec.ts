import { TestBed } from '@angular/core/testing';

import { NeedPayTicketService } from './need-pay-ticket.service';

describe('NeedPayTicketService', () => {
  let service: NeedPayTicketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NeedPayTicketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
