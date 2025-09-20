import { TestBed } from '@angular/core/testing';

import { Tls46050Service } from './tls46050.service';

describe('Tls46050Service', () => {
  let service: Tls46050Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tls46050Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
