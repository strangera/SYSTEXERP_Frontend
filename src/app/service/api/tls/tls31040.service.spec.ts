import { TestBed } from '@angular/core/testing';

import { Tls31040Service } from './tls31040.service';

describe('Tls31040Service', () => {
  let service: Tls31040Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tls31040Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
