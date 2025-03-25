import { TestBed } from '@angular/core/testing';

import { DisplayModeService } from './display-mode.service';

describe('DisplayModeService', () => {
  let service: DisplayModeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DisplayModeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
