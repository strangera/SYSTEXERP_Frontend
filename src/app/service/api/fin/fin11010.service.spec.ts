import { TestBed } from '@angular/core/testing';

import { FIN11010Service } from './fin11010.service';

describe('FIN11010Service', () => {
  let service: FIN11010Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FIN11010Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
