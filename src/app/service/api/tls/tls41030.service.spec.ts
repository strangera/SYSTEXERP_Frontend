import { TestBed } from '@angular/core/testing';

import { Tls41030Service } from './tls41030.service';

describe('Tls41030Service', () => {
  let service: Tls41030Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tls41030Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
