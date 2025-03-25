import { TestBed } from '@angular/core/testing';

import { JobnumberService } from './jobnumber.service';

describe('JobnumberService', () => {
  let service: JobnumberService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JobnumberService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
