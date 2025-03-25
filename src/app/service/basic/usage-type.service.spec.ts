import { TestBed } from '@angular/core/testing';

import { UsageTypeService } from './usage-type.service';

describe('UsageTypeService', () => {
  let service: UsageTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsageTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
