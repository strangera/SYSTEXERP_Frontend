import { TestBed } from '@angular/core/testing';

import { Tls23130Service } from './tls23130.service';

describe('Tls23130Service', () => {
  let service: Tls23130Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tls23130Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
