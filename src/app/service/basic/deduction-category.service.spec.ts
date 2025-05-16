import { TestBed } from '@angular/core/testing';

import { DeductionCategoryService } from './deduction.service';

describe('DeductionCategoryService', () => {
  let service: DeductionCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeductionCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
