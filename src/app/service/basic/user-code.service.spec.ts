import { TestBed } from '@angular/core/testing';

import { UserCodeService } from './user-code.service';

describe('UserCodeService', () => {
  let service: UserCodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserCodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
