import { TestBed } from '@angular/core/testing';

import { MerchantStatusService } from './merchant-status.service';

describe('MerchantStatusService', () => {
  let service: MerchantStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MerchantStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
