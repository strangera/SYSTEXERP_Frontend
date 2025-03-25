import { TestBed } from '@angular/core/testing';

import { PackageCategoryService } from './package-category.service';

describe('PackageCategoryService', () => {
  let service: PackageCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PackageCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
