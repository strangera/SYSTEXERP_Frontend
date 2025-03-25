import { TestBed } from '@angular/core/testing';

import { InvoiceManagementService } from './invoice-management.service';

describe('InvoiceManagementService', () => {
  let service: InvoiceManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InvoiceManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
