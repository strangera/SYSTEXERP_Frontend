import { TestBed } from '@angular/core/testing';

import { FIN15030Service } from './fin15030.service';

describe('FIN15030Service', () => {
  let service: FIN15030Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FIN15030Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
