import { TestBed } from '@angular/core/testing';

import { CreditCardInputStatusService } from './credit-card-input-status.service';

describe('CreditCardInputStatusService', () => {
  let service: CreditCardInputStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreditCardInputStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
