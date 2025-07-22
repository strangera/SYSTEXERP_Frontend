import { TestBed } from '@angular/core/testing';

import { TLS26030Service } from './tls26030.service';

describe('TLS26030Service', () => {
  let service: TLS26030Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS26030Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
