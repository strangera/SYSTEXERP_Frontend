import { TestBed } from '@angular/core/testing';

import { TLS2D040Service } from './tls2-d040.service';

describe('TLS2D040Service', () => {
  let service: TLS2D040Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS2D040Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
