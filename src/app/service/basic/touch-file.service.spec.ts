import { TestBed } from '@angular/core/testing';

import { TouchFileService } from './touch-file.service';

describe('TouchFileService', () => {
  let service: TouchFileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TouchFileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
