import { TestBed } from '@angular/core/testing';

import { BrandCodeService } from './brand-code.service';

describe('BrandCodeService', () => {
  let service: BrandCodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BrandCodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
