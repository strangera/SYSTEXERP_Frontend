import { TestBed } from '@angular/core/testing';

import { FIN13010Service } from './fin13010.service';

describe('FIN13010Service', () => {
  let service: FIN13010Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FIN13010Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
