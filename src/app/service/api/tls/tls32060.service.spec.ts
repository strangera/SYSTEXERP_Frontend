import { TestBed } from '@angular/core/testing';

import { TLS32060Service } from './tls32060.service';

describe('TLS32060Service', () => {
  let service: TLS32060Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS32060Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
