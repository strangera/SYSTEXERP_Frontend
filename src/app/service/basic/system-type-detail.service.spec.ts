import { TestBed } from '@angular/core/testing';

import { SystemTypeDetailService } from './system-type-detail.service';

describe('SystemTypeDetailService', () => {
  let service: SystemTypeDetailService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SystemTypeDetailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
