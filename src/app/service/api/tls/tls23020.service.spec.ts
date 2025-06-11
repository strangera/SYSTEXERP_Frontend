import { TestBed } from '@angular/core/testing';

import { Tls23020Service } from './tls23020.service';

describe('Tls23020Service', () => {
  let service: Tls23020Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tls23020Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
