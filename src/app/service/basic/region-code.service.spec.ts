import { TestBed } from '@angular/core/testing';

import { RegionCodeService } from './region-code.service';

describe('RegionCodeService', () => {
  let service: RegionCodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegionCodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
