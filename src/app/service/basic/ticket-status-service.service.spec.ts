import { TestBed } from '@angular/core/testing';

import { TicketStatusServiceService } from './ticket-status-service.service';

describe('TicketStatusServiceService', () => {
  let service: TicketStatusServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TicketStatusServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
