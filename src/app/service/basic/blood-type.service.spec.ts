import { TestBed } from '@angular/core/testing';

import { BloodTypeService } from './blood-type.service';

describe('BloodTypeService', () => {
  let service: BloodTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BloodTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
