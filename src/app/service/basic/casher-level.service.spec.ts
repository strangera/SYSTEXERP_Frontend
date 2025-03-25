import { TestBed } from '@angular/core/testing';

import { CasherLevelService } from './casher-level.service';

describe('CasherLevelService', () => {
  let service: CasherLevelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CasherLevelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
