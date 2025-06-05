import { TestBed } from '@angular/core/testing';

import { Tls23110Service } from './tls23110.service';

describe('Tls23110Service', () => {
  let service: Tls23110Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tls23110Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
