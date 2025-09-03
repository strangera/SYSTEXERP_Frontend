import { TestBed } from '@angular/core/testing';

import { TLS32010Service } from './tls32010.service';

describe('TLS32010Service', () => {
  let service: TLS32010Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS32010Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
