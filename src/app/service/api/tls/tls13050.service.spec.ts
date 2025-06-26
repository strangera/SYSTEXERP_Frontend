import { TestBed } from '@angular/core/testing';

import { Tls13050Service } from './tls13050.service';

describe('Tls13050Service', () => {
  let service: Tls13050Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tls13050Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
