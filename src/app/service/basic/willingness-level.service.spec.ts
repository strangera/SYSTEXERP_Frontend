import { TestBed } from '@angular/core/testing';

import { WillingnessLevelService } from './willingness-level.service';

describe('WillingnessLevelService', () => {
  let service: WillingnessLevelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WillingnessLevelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
