import { TestBed } from '@angular/core/testing';

import { Tls31060Service } from './tls31060.service';

describe('Tls31060Service', () => {
  let service: Tls31060Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tls31060Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
