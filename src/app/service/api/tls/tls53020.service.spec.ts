import { TestBed } from '@angular/core/testing';

import { TLS53020Service } from './tls53020.service';

describe('TLS53020Service', () => {
  let service: TLS53020Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS53020Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
