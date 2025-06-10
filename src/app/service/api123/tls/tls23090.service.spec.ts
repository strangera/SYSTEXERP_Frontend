import { TestBed } from '@angular/core/testing';

import { Tls23090Service } from './tls23090.service';

describe('Tls23090Service', () => {
  let service: Tls23090Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tls23090Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
