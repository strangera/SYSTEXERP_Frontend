import { TestBed } from '@angular/core/testing';

import { TLS11020Service } from './tls11020.service';

describe('Tls11020Service', () => {
  let service: TLS11020Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS11020Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
