import { TestBed } from '@angular/core/testing';

import { BusinessIdService } from './business-id.service';

describe('BusinessIdService', () => {
  let service: BusinessIdService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BusinessIdService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
