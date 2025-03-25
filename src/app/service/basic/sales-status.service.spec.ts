import { TestBed } from '@angular/core/testing';

import { SalesStatusService } from './sales-status.service';

describe('SalesStatusService', () => {
  let service: SalesStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SalesStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
