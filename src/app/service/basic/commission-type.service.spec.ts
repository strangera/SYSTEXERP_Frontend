import { TestBed } from '@angular/core/testing';

import { CommissionTypeService } from './commission-type.service';

describe('CommissionTypeService', () => {
  let service: CommissionTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommissionTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
