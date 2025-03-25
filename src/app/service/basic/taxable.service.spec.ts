import { TestBed } from '@angular/core/testing';

import { TaxableService } from './taxable.service';

describe('TaxableService', () => {
  let service: TaxableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaxableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
