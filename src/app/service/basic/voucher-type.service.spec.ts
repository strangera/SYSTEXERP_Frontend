import { TestBed } from '@angular/core/testing';

import { VoucherTypeService } from './voucher-type.service';

describe('VoucherTypeService', () => {
  let service: VoucherTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VoucherTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
