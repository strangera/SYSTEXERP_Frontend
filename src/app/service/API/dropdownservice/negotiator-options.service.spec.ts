import { TestBed } from '@angular/core/testing';

import { NegotiatorOptionsService } from './negotiator-options.service';

describe('NegotiatorOptionsService', () => {
  let service: NegotiatorOptionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NegotiatorOptionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
