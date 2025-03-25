import { TestBed } from '@angular/core/testing';

import { PosStatusService } from './pos-status.service';

describe('PosStatusService', () => {
  let service: PosStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PosStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
