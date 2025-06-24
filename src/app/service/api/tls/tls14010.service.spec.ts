import { TestBed } from '@angular/core/testing';

import { Tls14010Service } from './tls14010.service';

describe('Tls14010Service', () => {
  let service: Tls14010Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tls14010Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
