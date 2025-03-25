import { TestBed } from '@angular/core/testing';

import { PriceChangeStatusService } from './price-change-status.service';

describe('PriceChangeStatusService', () => {
  let service: PriceChangeStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PriceChangeStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
