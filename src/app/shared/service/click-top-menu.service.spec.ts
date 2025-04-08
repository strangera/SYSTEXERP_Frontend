import { TestBed } from '@angular/core/testing';

import { ClickTopMenuService } from './click-top-menu.service';

describe('ClickTopMenuService', () => {
  let service: ClickTopMenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClickTopMenuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
