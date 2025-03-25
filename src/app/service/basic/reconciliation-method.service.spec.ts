import { TestBed } from '@angular/core/testing';

import { ReconciliationMethodService } from './reconciliation-method.service';

describe('ReconciliationMethodService', () => {
  let service: ReconciliationMethodService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReconciliationMethodService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
