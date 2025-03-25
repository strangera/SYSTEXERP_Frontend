import { TestBed } from '@angular/core/testing';

import { DeductionbigCategoryService } from './deductionbig-category.service';

describe('DeductionbigCategoryService', () => {
  let service: DeductionbigCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeductionbigCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
