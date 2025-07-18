import { TestBed } from '@angular/core/testing';

import { Tls29010Service } from './tls29010.service';

describe('Tls29010Service', () => {
  let service: Tls29010Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tls29010Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
