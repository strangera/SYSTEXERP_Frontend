import { TestBed } from '@angular/core/testing';

import { InventoryCategoryService } from './inventory-category.service';

describe('InventoryCategoryService', () => {
  let service: InventoryCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InventoryCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
