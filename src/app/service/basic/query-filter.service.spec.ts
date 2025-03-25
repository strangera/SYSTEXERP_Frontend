import { TestBed } from '@angular/core/testing';

import { QueryFilterService } from './query-filter.service';

describe('QueryFilterService', () => {
  let service: QueryFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QueryFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
