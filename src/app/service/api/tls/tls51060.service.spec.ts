import { TestBed } from '@angular/core/testing';

import { Tls51060Service } from './tls51060.service';

describe('Tls51060Service', () => {
  let service: Tls51060Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tls51060Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
