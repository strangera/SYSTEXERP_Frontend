import { TestBed } from '@angular/core/testing';

import { ShouwupTypeService } from './shouwup-type.service';

describe('ShouwupTypeService', () => {
  let service: ShouwupTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShouwupTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
