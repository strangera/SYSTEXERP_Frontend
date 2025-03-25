import { TestBed } from '@angular/core/testing';

import { QueryAngleService } from './query-angle.service';

describe('QueryAngleService', () => {
  let service: QueryAngleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QueryAngleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
