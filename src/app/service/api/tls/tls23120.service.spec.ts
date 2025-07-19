import { TestBed } from '@angular/core/testing';

import { TLS23120Service } from './tls23120.service';

describe('Tls23120Service', () => {
  let service: TLS23120Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS23120Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
