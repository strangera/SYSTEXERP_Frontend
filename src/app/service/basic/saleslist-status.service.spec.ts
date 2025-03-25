import { TestBed } from '@angular/core/testing';

import { SaleslistStatusService } from './saleslist-status.service';

describe('SaleslistStatusService', () => {
  let service: SaleslistStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SaleslistStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
