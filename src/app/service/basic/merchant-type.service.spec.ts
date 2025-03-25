import { TestBed } from '@angular/core/testing';

import { MerchantTypeService } from './merchant-type.service';

describe('MerchantTypeService', () => {
  let service: MerchantTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MerchantTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
