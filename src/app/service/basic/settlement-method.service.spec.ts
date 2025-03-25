import { TestBed } from '@angular/core/testing';

import { SettlementMethodService } from './settlement-method.service';

describe('SettlementMethodService', () => {
  let service: SettlementMethodService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SettlementMethodService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
