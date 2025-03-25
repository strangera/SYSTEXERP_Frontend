import { TestBed } from '@angular/core/testing';

import { TaxTypeService } from './tax-type.service';

describe('TaxTypeService', () => {
  let service: TaxTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaxTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
