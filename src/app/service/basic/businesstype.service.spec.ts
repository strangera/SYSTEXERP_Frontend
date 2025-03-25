import { TestBed } from '@angular/core/testing';

import { BusinesstypeService } from './businesstype.service';

describe('BusinesstypeService', () => {
  let service: BusinesstypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BusinesstypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
