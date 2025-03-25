import { TestBed } from '@angular/core/testing';

import { ExportDeclarationCategoryService } from './export-declaration-category.service';

describe('ExportDeclarationCategoryService', () => {
  let service: ExportDeclarationCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExportDeclarationCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
