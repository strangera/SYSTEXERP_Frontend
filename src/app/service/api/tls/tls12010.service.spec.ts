import { TestBed } from '@angular/core/testing';

import { Tls12010Service } from './tls12010.service';

describe('Tls12010Service', () => {
  let service: Tls12010Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tls12010Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
