import { TestBed } from '@angular/core/testing';

import { CashierDistinctionService } from './cashier-distinction.service';

describe('CashierDistinctionService', () => {
  let service: CashierDistinctionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CashierDistinctionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
