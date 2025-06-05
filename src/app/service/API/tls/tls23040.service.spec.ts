import { TestBed } from '@angular/core/testing';

import { Tls23040Service } from './tls23040.service';

describe('Tls23040Service', () => {
  let service: Tls23040Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tls23040Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
