import { TestBed } from '@angular/core/testing';

import { TLS53030Service } from './tls53030.service';

describe('TLS53030Service', () => {
  let service: TLS53030Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS53030Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
