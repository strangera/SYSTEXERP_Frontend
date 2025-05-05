import { TestBed } from '@angular/core/testing';

import { AppMenulistService } from './app.menulist.service';

describe('AppMenulistService', () => {
  let service: AppMenulistService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppMenulistService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
