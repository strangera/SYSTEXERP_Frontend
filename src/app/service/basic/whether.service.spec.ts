import { TestBed } from '@angular/core/testing';

import { WhetherService } from './whether.service';

describe('WhetherService', () => {
  let service: WhetherService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WhetherService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
