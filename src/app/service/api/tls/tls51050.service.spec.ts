import { TestBed } from '@angular/core/testing';

import { Tls51050Service } from './tls51050.service';

describe('Tls51050Service', () => {
  let service: Tls51050Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tls51050Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
