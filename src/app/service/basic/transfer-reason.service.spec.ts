import { TestBed } from '@angular/core/testing';

import { TransferReasonService } from './transfer-reason.service';

describe('TransferReasonService', () => {
  let service: TransferReasonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransferReasonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
