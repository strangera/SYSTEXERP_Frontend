import { TestBed } from '@angular/core/testing';

import { MachineAttributeService } from './machine-attribute.service';

describe('MachineAttributeService', () => {
  let service: MachineAttributeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MachineAttributeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
