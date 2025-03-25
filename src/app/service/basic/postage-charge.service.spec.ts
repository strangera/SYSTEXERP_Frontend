import { TestBed } from '@angular/core/testing';

import { PostageChargeService } from './postage-charge.service';

describe('PostageChargeService', () => {
  let service: PostageChargeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostageChargeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
