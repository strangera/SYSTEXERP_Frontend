import { TestBed } from '@angular/core/testing';

import { TLS32030Service } from './tls32030.service';

describe('TLS32030Service', () => {
  let service: TLS32030Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS32030Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
