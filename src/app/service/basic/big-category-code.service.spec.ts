import { TestBed } from '@angular/core/testing';

import { BigCategoryCodeService } from './big-category-code.service';

describe('BigCategoryCodeService', () => {
  let service: BigCategoryCodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BigCategoryCodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
