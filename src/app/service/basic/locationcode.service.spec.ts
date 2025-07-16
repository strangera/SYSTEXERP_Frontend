import { TestBed } from '@angular/core/testing';

import { LocationCodeService } from './locationcode.service';

describe('LocationCodeService', () => {
  let service: LocationCodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocationCodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
