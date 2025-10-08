import { TestBed } from '@angular/core/testing';

import { Tls31080Service } from './tls31080.service';

describe('Tls31080Service', () => {
  let service: Tls31080Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tls31080Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
