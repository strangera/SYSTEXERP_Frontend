import { TestBed } from '@angular/core/testing';

import { Tls23080Service } from './tls23080.service';

describe('Tls23080Service', () => {
  let service: Tls23080Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tls23080Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
