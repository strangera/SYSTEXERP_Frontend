import { TestBed } from '@angular/core/testing';

import { TLS13030Service } from './tls13030.service';

describe('Tls13030Service', () => {
  let service: TLS13030Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS13030Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
