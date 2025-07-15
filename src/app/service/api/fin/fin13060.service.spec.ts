import { TestBed } from '@angular/core/testing';

import { FIN13060Service } from './fin13060.service';

describe('FIN13060Service', () => {
  let service: FIN13060Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FIN13060Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
