import { TestBed } from '@angular/core/testing';

import { Tls13030Service } from './tls13030.service';

describe('Tls13030Service', () => {
  let service: Tls13030Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tls13030Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
