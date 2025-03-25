import { TestBed } from '@angular/core/testing';

import { SettingFilesService } from './setting-files.service';

describe('SettingFilesService', () => {
  let service: SettingFilesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SettingFilesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
