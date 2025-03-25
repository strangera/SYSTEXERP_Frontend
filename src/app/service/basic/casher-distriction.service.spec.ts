import { TestBed } from '@angular/core/testing';

import { CasherDistrictionService } from './casher-distriction.service';

describe('CasherDistrictionService', () => {
  let service: CasherDistrictionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CasherDistrictionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
