import { TestBed } from '@angular/core/testing';

import { TXNStatusService } from './txn-status.service';

describe('TXNStatusService', () => {
  let service: TXNStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TXNStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
