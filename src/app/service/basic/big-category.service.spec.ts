import { TestBed } from '@angular/core/testing';

import { BigCategoryService } from './big-category.service';

describe('BigCategoryService', () => {
  let service: BigCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BigCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
