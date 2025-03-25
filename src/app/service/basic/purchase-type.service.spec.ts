import { TestBed } from '@angular/core/testing';

import { PurchaseTypeService } from './purchase-type.service';

describe('PurchaseTypeService', () => {
  let service: PurchaseTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PurchaseTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
