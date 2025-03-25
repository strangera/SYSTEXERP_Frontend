import { TestBed } from '@angular/core/testing';

import { OwnerCashCollectionService } from './owner-cash-collection.service';

describe('OwnerCashCollectionService', () => {
  let service: OwnerCashCollectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OwnerCashCollectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
