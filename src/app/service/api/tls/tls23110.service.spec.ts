import { TestBed } from '@angular/core/testing';

import { TLS23110Service } from './tls23110.service';

describe('Tls23110Service', () => {
  let service: TLS23110Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS23110Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
