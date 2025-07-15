import { TestBed } from '@angular/core/testing';

import { FIN13050Service } from './fin13050.service';

describe('FIN13050Service', () => {
  let service: FIN13050Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FIN13050Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
