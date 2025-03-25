import { TestBed } from '@angular/core/testing';

import { CounterCategoryService } from './counter-category.service';

describe('CounterCategoryService', () => {
  let service: CounterCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CounterCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
