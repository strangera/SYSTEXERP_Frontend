import { TestBed } from '@angular/core/testing';

import { SupplementCategoryService } from './supplement-category.service';

describe('SupplementCategoryService', () => {
  let service: SupplementCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SupplementCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
