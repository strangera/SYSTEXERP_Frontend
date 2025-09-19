import { TestBed } from '@angular/core/testing';

import { TLS55070Service } from './tls55070.service';

describe('TLS55070Service', () => {
  let service: TLS55070Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS55070Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
