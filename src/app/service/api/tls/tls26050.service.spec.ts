import { TestBed } from '@angular/core/testing';

import { TLS26050Service } from './tls26050.service';

describe('TLS26050Service', () => {
  let service: TLS26050Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS26050Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
