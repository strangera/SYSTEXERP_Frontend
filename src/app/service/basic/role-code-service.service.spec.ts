import { TestBed } from '@angular/core/testing';

import { RoleCodeServiceService } from './role-code-service.service';

describe('RoleCodeServiceService', () => {
  let service: RoleCodeServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoleCodeServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
