import { TestBed } from '@angular/core/testing';

import { SharedCodeService } from './shared-code.service';

describe('SharedCodeService', () => {
  let service: SharedCodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SharedCodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
