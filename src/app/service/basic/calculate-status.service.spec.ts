import { TestBed } from '@angular/core/testing';

import { CalculateStatusService } from './calculate-status.service';

describe('CalculateStatusService', () => {
  let service: CalculateStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalculateStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
