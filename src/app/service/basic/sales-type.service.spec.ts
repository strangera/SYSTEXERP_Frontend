import { TestBed } from '@angular/core/testing';

import { SalesTypeService } from './sales-type.service';

describe('SalesTypeService', () => {
  let service: SalesTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SalesTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
