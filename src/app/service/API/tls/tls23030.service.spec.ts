import { TestBed } from '@angular/core/testing';

import { Tls23030Service } from './tls23030.service';

describe('Tls23030Service', () => {
  let service: Tls23030Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tls23030Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
