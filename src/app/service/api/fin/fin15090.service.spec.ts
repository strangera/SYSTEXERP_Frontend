import { TestBed } from '@angular/core/testing';

import { FIN15090Service } from './fin15090.service';

describe('FIN15090Service', () => {
  let service: FIN15090Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FIN15090Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
