import { TestBed } from '@angular/core/testing';

import { TLS51130Service } from './tls51130.service';

describe('TLS51130Service', () => {
  let service: TLS51130Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS51130Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
