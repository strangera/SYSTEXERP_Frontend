import { TestBed } from '@angular/core/testing';

import { FIN13020Service } from './fin13020.service';

describe('FIN13020Service', () => {
  let service: FIN13020Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FIN13020Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
