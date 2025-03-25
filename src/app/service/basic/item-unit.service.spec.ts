import { TestBed } from '@angular/core/testing';

import { ItemUnitService } from './item-unit.service';

describe('ItemUnitService', () => {
  let service: ItemUnitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ItemUnitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
