import { TestBed } from '@angular/core/testing';

import { TLS23030Service } from './tls23030.service';

describe('Tls23030Service', () => {
  let service: TLS23030Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS23030Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
