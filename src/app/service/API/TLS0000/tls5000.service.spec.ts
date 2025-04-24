import { TestBed } from '@angular/core/testing';

import { TLS5000Service } from './tls5000.service';

describe('Tls5000Service', () => {
  let service: TLS5000Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS5000Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
