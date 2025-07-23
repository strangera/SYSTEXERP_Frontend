import { TestBed } from '@angular/core/testing';

import { TLS26070Service } from './tls26070.service';

describe('TLS26070Service', () => {
  let service: TLS26070Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS26070Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
