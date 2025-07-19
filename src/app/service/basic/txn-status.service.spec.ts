import { TestBed } from '@angular/core/testing';

import { TxnStatusService } from './txn-status.service';

describe('TxnStatusService', () => {
  let service: TxnStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TxnStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
