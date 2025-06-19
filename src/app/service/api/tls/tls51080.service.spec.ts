import { TestBed } from '@angular/core/testing';

import { Tls51080Service } from './tls51080.service';

describe('Tls51080Service', () => {
  let service: Tls51080Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tls51080Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
