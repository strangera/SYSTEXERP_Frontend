import { TestBed } from '@angular/core/testing';

import { TLS2C020Service } from './tls2-c020.service';

describe('TLS2C020Service', () => {
  let service: TLS2C020Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS2C020Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
