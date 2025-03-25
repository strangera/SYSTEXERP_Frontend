import { TestBed } from '@angular/core/testing';

import { CashShowupByService } from './cash-showup-by.service';

describe('CashShowupByService', () => {
  let service: CashShowupByService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CashShowupByService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
