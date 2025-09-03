import { TestBed } from '@angular/core/testing';

import { Tls31030Service } from './tls31030.service';

describe('Tls31030Service', () => {
  let service: Tls31030Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tls31030Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
