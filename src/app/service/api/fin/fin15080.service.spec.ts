import { TestBed } from '@angular/core/testing';

import { FIN15080Service } from './fin15080.service';

describe('FIN15080Service', () => {
  let service: FIN15080Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FIN15080Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
