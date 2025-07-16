import { TestBed } from '@angular/core/testing';

import { TLS23040Service } from './tls23040.service';

describe('Tls23040Service', () => {
  let service: TLS23040Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS23040Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
