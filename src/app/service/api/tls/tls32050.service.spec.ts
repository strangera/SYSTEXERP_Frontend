import { TestBed } from '@angular/core/testing';

import { TLS32050Service } from './tls32050.service';

describe('TLS32050Service', () => {
  let service: TLS32050Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS32050Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
