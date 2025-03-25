import { TestBed } from '@angular/core/testing';

import { InstallmentPeriodService } from './installment-period.service';

describe('InstallmentPeriodService', () => {
  let service: InstallmentPeriodService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InstallmentPeriodService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
