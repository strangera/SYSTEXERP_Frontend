import { TestBed } from '@angular/core/testing';

import { ECRNoService } from './ECRNo.service';

describe('ECRNoService', () => {
  let service: ECRNoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ECRNoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
