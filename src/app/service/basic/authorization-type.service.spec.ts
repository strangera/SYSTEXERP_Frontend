import { TestBed } from '@angular/core/testing';

import { AuthorizationTypeService } from './authorization-type.service';

describe('AuthorizationTypeService', () => {
  let service: AuthorizationTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthorizationTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
