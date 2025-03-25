import { TestBed } from '@angular/core/testing';

import { PaymentToolTypeService } from './payment-tool-type.service';

describe('PaymentToolTypeSService', () => {
  let service: PaymentToolTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentToolTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
