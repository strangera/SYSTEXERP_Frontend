import { TestBed } from '@angular/core/testing';

import { ViolationStatusService } from './violation-status.service';

describe('ViolationStatusService', () => {
  let service: ViolationStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ViolationStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
