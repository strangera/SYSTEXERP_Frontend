import { TestBed } from '@angular/core/testing';

import { AllpayCodeService } from './allpay-code.service';

describe('AllpayCodeService', () => {
  let service: AllpayCodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AllpayCodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
