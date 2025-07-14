import { TestBed } from '@angular/core/testing';

import { TLS41020Service } from './tls41020.service';

describe('TLS41020Service', () => {
  let service: TLS41020Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS41020Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
