import { TestBed } from '@angular/core/testing';

import { Tls31050Service } from './tls31050.service';

describe('Tls31050Service', () => {
  let service: Tls31050Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tls31050Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
