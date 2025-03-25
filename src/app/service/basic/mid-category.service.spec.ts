import { TestBed } from '@angular/core/testing';

import { MidCategoryService } from './mid-category.service';

describe('MidCategoryService', () => {
  let service: MidCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MidCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
