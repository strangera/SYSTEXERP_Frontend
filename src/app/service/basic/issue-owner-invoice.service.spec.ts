import { TestBed } from '@angular/core/testing';

import { IssueOwnerInvoiceService } from './issue-owner-invoice.service';

describe('IssueOwnerInvoiceService', () => {
  let service: IssueOwnerInvoiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IssueOwnerInvoiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
