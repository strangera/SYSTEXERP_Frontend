import { TestBed } from '@angular/core/testing';

import { TLS53010Service } from './tls53010.service';

describe('TLS53010Service', () => {
  let service: TLS53010Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS53010Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
