import { TestBed } from '@angular/core/testing';

import { TLS23130Service } from './tls23130.service';

describe('Tls23130Service', () => {
  let service: TLS23130Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS23130Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
