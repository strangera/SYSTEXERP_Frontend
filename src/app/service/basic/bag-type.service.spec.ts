import { TestBed } from '@angular/core/testing';

import { BagTypeService } from './bag-type.service';

describe('BagTypeService', () => {
  let service: BagTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BagTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
