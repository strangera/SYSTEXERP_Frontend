import { TestBed } from '@angular/core/testing';

import { TLS23020Service } from './tls23020.service';

describe('Tls23020Service', () => {
  let service: TLS23020Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS23020Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
