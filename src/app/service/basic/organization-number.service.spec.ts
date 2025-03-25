import { TestBed } from '@angular/core/testing';

import { OrganizationNumberService } from './organization-number.service';

describe('OrganizationNumberService', () => {
  let service: OrganizationNumberService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrganizationNumberService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
