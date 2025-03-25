import { TestBed } from '@angular/core/testing';

import { TransactionSubTypeService } from './transaction-sub-type.service';

describe('TransactionSubTypeService', () => {
  let service: TransactionSubTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransactionSubTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
