import { TestBed } from '@angular/core/testing';

import { TXN_SubtypeService } from './TXN_Subtype.service';

describe('TXN_SubtypeService', () => {
  let service: TXN_SubtypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TXN_SubtypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
