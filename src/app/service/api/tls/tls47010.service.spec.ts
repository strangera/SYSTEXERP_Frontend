import { TestBed } from '@angular/core/testing';

import { TLS47010Service } from './tls47010.service';

describe('TLS47010Service', () => {
  let service: TLS47010Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS47010Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
