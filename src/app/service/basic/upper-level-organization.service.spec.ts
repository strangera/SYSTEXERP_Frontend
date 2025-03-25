import { TestBed } from '@angular/core/testing';

import { UpperLevelOrganizationService } from './upper-level-organization.service';

describe('UpperLevelOrganizationService', () => {
  let service: UpperLevelOrganizationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UpperLevelOrganizationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
