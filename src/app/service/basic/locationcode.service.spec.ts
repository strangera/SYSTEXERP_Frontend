import { TestBed } from '@angular/core/testing';

import { LocationcodeService } from './locationcode.service';

describe('LocationcodeService', () => {
  let service: LocationcodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocationcodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
