import { TestBed } from '@angular/core/testing';

import { AssetsTypeService } from './assets-type.service';

describe('AssetsTypeService', () => {
  let service: AssetsTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssetsTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
