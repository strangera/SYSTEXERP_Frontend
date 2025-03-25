import { TestBed } from '@angular/core/testing';

import { CustomheaderinterceptorService } from './customheaderinterceptor.service';

describe('CustomheaderinterceptorService', () => {
  let service: CustomheaderinterceptorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomheaderinterceptorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
