import { TestBed } from '@angular/core/testing';

import { TLS23080Service } from './tls23080.service';

describe('Tls23080Service', () => {
  let service: TLS23080Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS23080Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
