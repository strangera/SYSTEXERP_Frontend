import { TestBed } from '@angular/core/testing';

import { AllInvoiceCategoryService } from './all-invoice-category.service';

describe('AllInvoiceCategoryService', () => {
  let service: AllInvoiceCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AllInvoiceCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
