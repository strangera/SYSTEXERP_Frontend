import { TestBed } from '@angular/core/testing';

import { TLS23100Service } from './tls23100.service';

describe('Tls23100Service', () => {
  let service: TLS23100Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS23100Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
