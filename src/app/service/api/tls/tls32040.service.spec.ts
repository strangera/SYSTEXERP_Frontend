import { TestBed } from '@angular/core/testing';

import { TLS32040Service } from './tls32040.service';

describe('TLS32040Service', () => {
  let service: TLS32040Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS32040Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
