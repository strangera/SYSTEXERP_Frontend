import { TestBed } from '@angular/core/testing';

import { DecorationMethodService } from './decoration-method.service';

describe('DecorationMethodService', () => {
  let service: DecorationMethodService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DecorationMethodService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
