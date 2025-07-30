import { TestBed } from '@angular/core/testing';

import { Tls12070Service } from './tls12070.service';

describe('Tls12070Service', () => {
  let service: Tls12070Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tls12070Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
