import { TestBed } from '@angular/core/testing';

import { ViolationCategoryService } from './violation-category.service';

describe('ViolationCategoryService', () => {
  let service: ViolationCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ViolationCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
