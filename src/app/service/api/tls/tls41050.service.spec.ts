import { TestBed } from '@angular/core/testing';

import { Tls41050Service } from './tls41050.service';

describe('Tls41050Service', () => {
  let service: Tls41050Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tls41050Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
