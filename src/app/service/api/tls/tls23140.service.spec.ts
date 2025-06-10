import { TestBed } from '@angular/core/testing';

import { Tls23140Service } from './tls23140.service';

describe('Tls23140Service', () => {
  let service: Tls23140Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tls23140Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
