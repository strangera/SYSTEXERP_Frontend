import { TestBed } from '@angular/core/testing';

import { TLS42020Service } from './tls42020.service';

describe('TLS42020Service', () => {
  let service: TLS42020Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS42020Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
