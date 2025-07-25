import { TestBed } from '@angular/core/testing';

import { TLS2C050Service } from './tls2-c050.service';

describe('TLS2C050Service', () => {
  let service: TLS2C050Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS2C050Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
