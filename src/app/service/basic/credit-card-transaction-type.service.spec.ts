import { TestBed } from '@angular/core/testing';

import { CreditCardTransactionTypeService } from './credit-card-transaction-type.service';

describe('CreditCardTransactionTypeService', () => {
  let service: CreditCardTransactionTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreditCardTransactionTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
