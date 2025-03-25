import { TestBed } from '@angular/core/testing';

import { StorageInventoryStatusService } from './storage-inventory-status.service';

describe('StorageInventoryStatusService', () => {
  let service: StorageInventoryStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageInventoryStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
