import { TestBed } from '@angular/core/testing';

import { JobNumberService } from './jobnumber.service';

describe('JobNumberService', () => {
  let service: JobNumberService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JobNumberService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
