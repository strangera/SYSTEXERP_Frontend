import { TestBed } from '@angular/core/testing';

import { SystemTypeService } from './system-type.service';

describe('SystemTypeService', () => {
  let service: SystemTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SystemTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
