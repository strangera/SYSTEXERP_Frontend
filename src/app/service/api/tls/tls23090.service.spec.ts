import { TestBed } from '@angular/core/testing';

import { TLS23090Service } from './tls23090.service';

describe('Tls23090Service', () => {
  let service: TLS23090Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS23090Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
