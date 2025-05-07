import { TestBed } from '@angular/core/testing';

import { Sysb900DropdownService } from './sysb900-dropdown.service';

describe('Sysb900DropdownService', () => {
  let service: Sysb900DropdownService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Sysb900DropdownService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
