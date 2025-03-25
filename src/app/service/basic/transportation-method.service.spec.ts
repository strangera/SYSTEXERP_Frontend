import { TestBed } from '@angular/core/testing';

import { TransportationMethodService } from './transportation-method.service';

describe('TransportationMethodService', () => {
  let service: TransportationMethodService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TransportationMethodService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
