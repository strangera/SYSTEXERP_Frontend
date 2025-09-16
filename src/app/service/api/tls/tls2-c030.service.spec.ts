import { TestBed } from '@angular/core/testing';

import { TLS2C030Service } from './tls2-c030.service';

describe('TLS2C030Service', () => {
  let service: TLS2C030Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS2C030Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
