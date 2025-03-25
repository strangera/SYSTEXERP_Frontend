import { TestBed } from '@angular/core/testing';

import { ReleaseInvoiceService } from './release-invoice.service';

describe('ReleaseInvoiceService', () => {
  let service: ReleaseInvoiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReleaseInvoiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
