import { TestBed } from '@angular/core/testing';

import { TLS26040Service } from './tls26040.service';

describe('TLS26040Service', () => {
  let service: TLS26040Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS26040Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
