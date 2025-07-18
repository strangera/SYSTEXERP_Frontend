import { TestBed } from '@angular/core/testing';

import { TLS23140Service } from './tls23140.service';

describe('Tls23140Service', () => {
  let service: TLS23140Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS23140Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
