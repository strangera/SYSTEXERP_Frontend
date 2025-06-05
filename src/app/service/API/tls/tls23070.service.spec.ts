import { TestBed } from '@angular/core/testing';

import { Tls23070Service } from './tls23070.service';

describe('Tls23070Service', () => {
  let service: Tls23070Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tls23070Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
