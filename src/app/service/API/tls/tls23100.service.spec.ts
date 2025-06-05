import { TestBed } from '@angular/core/testing';

import { Tls23100Service } from './tls23100.service';

describe('Tls23100Service', () => {
  let service: Tls23100Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tls23100Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
