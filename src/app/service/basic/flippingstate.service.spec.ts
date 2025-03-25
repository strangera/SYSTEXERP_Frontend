import { TestBed } from '@angular/core/testing';

import { FlippingstateService } from './flippingstate.service';

describe('FlippingstateService', () => {
  let service: FlippingstateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FlippingstateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
