import { TestBed } from '@angular/core/testing';

import { InventoryStatusService } from './inventory-status.service';

describe('InventoryStatusService', () => {
  let service: InventoryStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InventoryStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
