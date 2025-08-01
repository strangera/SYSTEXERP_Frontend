import { TestBed } from '@angular/core/testing';

import { FIN15010Service } from './fin15010.service';

describe('FIN15010Service', () => {
  let service: FIN15010Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FIN15010Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
