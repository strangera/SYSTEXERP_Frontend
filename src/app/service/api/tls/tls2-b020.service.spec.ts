import { TestBed } from '@angular/core/testing';

import { TLS2B020Service } from './tls2-b020.service';

describe('TLS2B020Service', () => {
  let service: TLS2B020Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS2B020Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
