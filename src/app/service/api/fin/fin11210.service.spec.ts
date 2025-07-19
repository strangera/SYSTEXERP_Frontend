import { TestBed } from '@angular/core/testing';

import { FIN11210Service } from './fin11210.service';

describe('Fin11210Service', () => {
  let service: FIN11210Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FIN11210Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
