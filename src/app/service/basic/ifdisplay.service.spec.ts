import { TestBed } from '@angular/core/testing';

import { IfdisplayService } from './ifdisplay.service';

describe('IfdisplayService', () => {
  let service: IfdisplayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IfdisplayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
