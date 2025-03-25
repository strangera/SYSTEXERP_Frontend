import { TestBed } from '@angular/core/testing';

import { MargintypeService } from './margintype.service';

describe('MargintypeService', () => {
  let service: MargintypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MargintypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
