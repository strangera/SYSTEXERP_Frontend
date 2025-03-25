import { TestBed } from '@angular/core/testing';

import { CommissionCalculationService } from './commission-calculation.service';

describe('CommissionCalculationService', () => {
  let service: CommissionCalculationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommissionCalculationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
