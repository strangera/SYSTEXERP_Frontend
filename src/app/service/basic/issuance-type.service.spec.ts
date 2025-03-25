import { TestBed } from '@angular/core/testing';

import { IssuanceTypeService } from './issuance-type.service';

describe('IssuanceTypeService', () => {
  let service: IssuanceTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IssuanceTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
