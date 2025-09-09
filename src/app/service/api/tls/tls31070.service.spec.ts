import { TestBed } from '@angular/core/testing';

import { Tls31070Service } from './tls31070.service';

describe('Tls31070Service', () => {
  let service: Tls31070Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tls31070Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
