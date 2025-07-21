import { TestBed } from '@angular/core/testing';

import { TLS2B010Service } from './tls2-b010.service';

describe('TLS2B010Service', () => {
  let service: TLS2B010Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TLS2B010Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
