import { TestBed } from '@angular/core/testing';

import { AcquiringBankService } from './acquiring-bank.service';

describe('AcquiringBankService', () => {
  let service: AcquiringBankService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AcquiringBankService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
