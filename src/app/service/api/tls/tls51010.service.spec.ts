import { TestBed } from '@angular/core/testing';

import { Tls51010Service } from './tls51010.service';

describe('Tls51010Service', () => {
  let service: Tls51010Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tls51010Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
