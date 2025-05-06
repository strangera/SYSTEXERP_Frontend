import { TestBed } from '@angular/core/testing';

import { Sysb800DropdownService } from './sysb800-dropdown.service';

describe('Sysb800DropdownService', () => {
  let service: Sysb800DropdownService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Sysb800DropdownService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
