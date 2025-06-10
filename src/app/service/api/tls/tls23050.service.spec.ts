import { TestBed } from '@angular/core/testing';

import { Tls23050Service } from './tls23050.service';

describe('Tls23050Service', () => {
  let service: Tls23050Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tls23050Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
