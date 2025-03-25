import { TestBed } from '@angular/core/testing';

import { ManagementIDService } from './management-id.service';

describe('ManagementIDService', () => {
  let service: ManagementIDService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManagementIDService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
