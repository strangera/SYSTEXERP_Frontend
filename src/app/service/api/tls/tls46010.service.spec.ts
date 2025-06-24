import { TestBed } from '@angular/core/testing';

import { Tls46010Service } from './tls46010.service';

describe('Tls46010Service', () => {
  let service: Tls46010Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tls46010Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
