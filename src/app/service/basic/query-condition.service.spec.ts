import { TestBed } from '@angular/core/testing';

import { QueryConditionService } from './query-condition.service';

describe('QueryConditionService', () => {
  let service: QueryConditionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QueryConditionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
