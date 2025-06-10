import { TestBed } from '@angular/core/testing';

import { LocationOptionsService } from './location-options.service';

describe('LocationOptionsService', () => {
  let service: LocationOptionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocationOptionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
