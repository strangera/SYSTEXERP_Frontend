import { TestBed } from '@angular/core/testing';

import { Tls13070Service } from './tls13070.service';

describe('Tls13070Service', () => {
  let service: Tls13070Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tls13070Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
