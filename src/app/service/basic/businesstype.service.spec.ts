import { TestBed } from '@angular/core/testing';

import { BusinessTypeService } from './businesstype.service';

describe('BusinessTypeService', () => {
  let service: BusinessTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BusinessTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
