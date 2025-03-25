import { TestBed } from '@angular/core/testing';

import { RoleCodeService } from './role-code.service';

describe('RoleCodeService', () => {
  let service: RoleCodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoleCodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
