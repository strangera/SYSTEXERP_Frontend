import { TestBed } from '@angular/core/testing';

import { AnalysisdateCService } from './analysisdate-c.service';

describe('AnalysisdateCService', () => {
  let service: AnalysisdateCService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnalysisdateCService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
