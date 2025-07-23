import { TestBed } from '@angular/core/testing';

import { Tls12060Service } from './tls12060.service';

describe('Tls12060Service', () => {
  let service: Tls12060Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tls12060Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
