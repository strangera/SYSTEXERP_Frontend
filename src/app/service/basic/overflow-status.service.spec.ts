import { TestBed } from '@angular/core/testing';

import { OverflowStatusService } from './overflow-status.service';

describe('OverflowStatusService', () => {
  let service: OverflowStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OverflowStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
