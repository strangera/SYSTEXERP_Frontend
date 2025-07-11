import { TestBed } from '@angular/core/testing';

import { FIN13030Service } from './fin13030.service';

describe('FIN13030Service', () => {
  let service: FIN13030Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FIN13030Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
