import { TestBed } from '@angular/core/testing';

import { Tls23060Service } from './tls23060.service';

describe('Tls23060Service', () => {
  let service: Tls23060Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tls23060Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
