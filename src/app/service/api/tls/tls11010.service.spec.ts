import { TestBed } from '@angular/core/testing';

import { Tls11010Service } from './tls11010.service';

describe('Tls11010Service', () => {
  let service: Tls11010Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tls11010Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
