import { TestBed } from '@angular/core/testing';

import { ExcessHandlingMethodService } from './excess-handling-method.service';

describe('ExcessHandlingMethodService', () => {
  let service: ExcessHandlingMethodService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExcessHandlingMethodService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
