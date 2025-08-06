import { TestBed } from '@angular/core/testing';

import { TLS2C040Service } from './tls2c040.service';

describe('TLS2C040Service', () => {
  let service: TLS2C040Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS2C040Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
