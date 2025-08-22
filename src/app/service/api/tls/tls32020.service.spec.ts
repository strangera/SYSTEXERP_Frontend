import { TestBed } from '@angular/core/testing';

import { TLS32020Service } from './tls32020.service';

describe('TLS32020Service', () => {
  let service: TLS32020Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS32020Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
