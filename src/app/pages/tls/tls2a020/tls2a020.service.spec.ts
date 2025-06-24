import { TestBed } from '@angular/core/testing';

import { Tls2a020Service } from './tls2a020.service';

describe('Tls2a020Service', () => {
  let service: Tls2a020Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tls2a020Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
