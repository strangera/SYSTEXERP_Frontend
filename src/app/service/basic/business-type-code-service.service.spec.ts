import { TestBed } from '@angular/core/testing';

import { BusinessTypeCodeServiceService } from './business-type-code-service.service';

describe('BusinessTypeCodeServiceService', () => {
  let service: BusinessTypeCodeServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BusinessTypeCodeServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
