import { TestBed } from '@angular/core/testing';

import { SalesLocationService } from './sales-location.service';

describe('SalesLocationService', () => {
  let service: SalesLocationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SalesLocationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
