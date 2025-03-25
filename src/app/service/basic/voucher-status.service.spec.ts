import { TestBed } from '@angular/core/testing';

import { VoucherStatusService } from './voucher-status.service';

describe('VoucherStatusService', () => {
  let service: VoucherStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VoucherStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
