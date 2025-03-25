import { TestBed } from '@angular/core/testing';

import { TransactionMachineService } from './transaction-machine.service';

describe('TransactionMachineService', () => {
  let service: TransactionMachineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransactionMachineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
