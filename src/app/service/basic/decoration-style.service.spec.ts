import { TestBed } from '@angular/core/testing';

import { DecorationStyleService } from './decoration-style.service';

describe('DecorationStyleService', () => {
  let service: DecorationStyleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DecorationStyleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
