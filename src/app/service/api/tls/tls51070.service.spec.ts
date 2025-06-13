import { TestBed } from '@angular/core/testing';

import { Tls51070Service } from './tls51070.service';

describe('Tls51070Service', () => {
  let service: Tls51070Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tls51070Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
