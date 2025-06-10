import { TestBed } from '@angular/core/testing';

import { TLS23010Service } from './tls23010.service';

describe('TLS23010Service', () => {
  let service: TLS23010Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS23010Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
