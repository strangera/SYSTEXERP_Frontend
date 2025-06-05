import { TestBed } from '@angular/core/testing';

import { Tls23120Service } from './tls23120.service';

describe('Tls23120Service', () => {
  let service: Tls23120Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tls23120Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
