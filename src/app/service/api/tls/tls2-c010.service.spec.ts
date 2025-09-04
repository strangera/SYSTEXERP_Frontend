import { TestBed } from '@angular/core/testing';

import { TLS2C010Service } from './tls2-c010.service';

describe('TLS2C010Service', () => {
  let service: TLS2C010Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS2C010Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
