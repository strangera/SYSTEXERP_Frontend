import { TestBed } from '@angular/core/testing';

import { FIN12020Service } from './fin12020.service';

describe('FIN12020Service', () => {
  let service: FIN12020Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FIN12020Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
