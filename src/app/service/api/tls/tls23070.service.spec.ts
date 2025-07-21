import { TestBed } from '@angular/core/testing';

import { TLS23070Service } from './tls23070.service';

describe('Tls23070Service', () => {
  let service: TLS23070Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS23070Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
