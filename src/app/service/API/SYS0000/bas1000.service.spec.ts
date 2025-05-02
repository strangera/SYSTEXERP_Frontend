import { TestBed } from '@angular/core/testing';

import { Bas1000Service } from './bas1000.service';

describe('Bas1000Service', () => {
  let service: Bas1000Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Bas1000Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
