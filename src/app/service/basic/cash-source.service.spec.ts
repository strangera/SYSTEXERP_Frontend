import { TestBed } from '@angular/core/testing';

import { CashSourceService } from './cash-source.service';

describe('CashSourceService', () => {
  let service: CashSourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CashSourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
