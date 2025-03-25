import { TestBed } from '@angular/core/testing';

import { ManagementMethodService } from './management-method.service';

describe('ManagementMethodService', () => {
  let service: ManagementMethodService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManagementMethodService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
