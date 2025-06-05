import { TestBed } from '@angular/core/testing';

import { MultiLocationFilterService } from './multi-location-filter.service';

describe('MultiLocationFilterService', () => {
  let service: MultiLocationFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MultiLocationFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
