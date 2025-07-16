import { TestBed } from '@angular/core/testing';

import { TLS2B030Service } from './tls2-b030.service';

describe('TLS2B030Service', () => {
  let service: TLS2B030Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS2B030Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
