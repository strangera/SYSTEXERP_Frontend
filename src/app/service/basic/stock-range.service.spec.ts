import { TestBed } from '@angular/core/testing';

import { StockRangeService } from './stock-range.service';

describe('StockRangeService', () => {
  let service: StockRangeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StockRangeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
