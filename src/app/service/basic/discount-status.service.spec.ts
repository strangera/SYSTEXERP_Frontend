import { TestBed } from '@angular/core/testing';

import { DiscountStatusService } from './discount-status.service';

describe('DiscountStatusService', () => {
  let service: DiscountStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiscountStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
