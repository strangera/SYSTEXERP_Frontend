import { TestBed } from '@angular/core/testing';

import { InvoiceCategoryService } from './invoice-category.service';

describe('InvoiceCategoryService', () => {
  let service: InvoiceCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InvoiceCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
