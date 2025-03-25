import { TestBed } from '@angular/core/testing';

import { PosServerService } from './pos-server.service';

describe('PosServerService', () => {
  let service: PosServerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PosServerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
