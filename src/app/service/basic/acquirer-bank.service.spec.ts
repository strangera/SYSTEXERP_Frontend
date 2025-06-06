import { TestBed } from '@angular/core/testing';

import { AcquirerBankService } from './acquirer-bank.service';

describe('AcquirerBankService', () => {
  let service: AcquirerBankService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AcquirerBankService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
