import { TestBed } from '@angular/core/testing';

import { Tls31020Service } from './tls31020.service';

describe('Tls31020Service', () => {
  let service: Tls31020Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tls31020Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
