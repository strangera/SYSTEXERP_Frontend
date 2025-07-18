import { TestBed } from '@angular/core/testing';

import { TLS23060Service } from './tls23060.service';

describe('Tls23060Service', () => {
  let service: TLS23060Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS23060Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
