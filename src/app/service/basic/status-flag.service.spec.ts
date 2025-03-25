import { TestBed } from '@angular/core/testing';

import { StatusFlagService } from './status-flag.service';

describe('StatusFlagService', () => {
  let service: StatusFlagService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StatusFlagService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
