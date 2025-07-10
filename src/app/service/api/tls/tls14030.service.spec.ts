import { TestBed } from '@angular/core/testing';

import { Tls14030Service } from './tls14030.service';

describe('Tls14030Service', () => {
  let service: Tls14030Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tls14030Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
