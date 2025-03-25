import { TestBed } from '@angular/core/testing';

import { CooperationMethodService } from './cooperation-method.service';

describe('CooperationMethodService', () => {
  let service: CooperationMethodService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CooperationMethodService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
