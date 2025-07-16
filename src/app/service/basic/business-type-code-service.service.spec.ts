import { TestBed } from '@angular/core/testing';

import { BusinessTypeCodeService } from './business-type-code-service.service';

describe('BusinessTypeCodeService', () => {
  let service: BusinessTypeCodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BusinessTypeCodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
