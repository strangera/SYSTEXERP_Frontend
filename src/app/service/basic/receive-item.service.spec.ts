import { TestBed } from '@angular/core/testing';

import { ReceiveItemService } from './receive-item.service';

describe('ReceiveItemService', () => {
  let service: ReceiveItemService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReceiveItemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
