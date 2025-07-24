import { TestBed } from '@angular/core/testing';

import { TLS26060Service } from './tls26060.service';

describe('TLS26060Service', () => {
  let service: TLS26060Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS26060Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
