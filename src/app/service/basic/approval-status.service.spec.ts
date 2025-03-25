import { TestBed } from '@angular/core/testing';

import { ApprovalStatusService } from './approval-status.service';

describe('ApprovalStatusService', () => {
  let service: ApprovalStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApprovalStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
