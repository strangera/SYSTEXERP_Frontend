import { TestBed } from '@angular/core/testing';

import { FIN15020Service } from './fin15020.service';

describe('FIN15020Service', () => {
  let service: FIN15020Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FIN15020Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
