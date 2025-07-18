import { TestBed } from '@angular/core/testing';

import { TLS23050Service } from './tls23050.service';

describe('Tls23050Service', () => {
  let service: TLS23050Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS23050Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
