import { TestBed } from '@angular/core/testing';

import { PayMachineAttributeService } from './pay-machine-attribute.service';

describe('PayMachineAttributeService', () => {
  let service: PayMachineAttributeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PayMachineAttributeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
