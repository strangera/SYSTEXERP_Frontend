import { TestBed } from '@angular/core/testing';

import { CarrierTypeService } from './carrier-type.service';

describe('CarrierTypeService', () => {
  let service: CarrierTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CarrierTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
