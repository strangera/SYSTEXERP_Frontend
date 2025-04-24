import { TestBed } from '@angular/core/testing';

import { SsoDashboardService } from './sso-dashboard.service';

describe('SsoDashboardService', () => {
  let service: SsoDashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SsoDashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
