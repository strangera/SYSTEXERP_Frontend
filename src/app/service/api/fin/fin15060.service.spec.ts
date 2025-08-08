import { TestBed } from '@angular/core/testing';

import { FIN15060Service } from './fin15060.service';

describe('FIN15060Service', () => {
  let service: FIN15060Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FIN15060Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
