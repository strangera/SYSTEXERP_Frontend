import { TestBed } from '@angular/core/testing';

import { InvoiceStatusService } from './invoice-status.service';

describe('InvoiceStatusService', () => {
  let service: InvoiceStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InvoiceStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
