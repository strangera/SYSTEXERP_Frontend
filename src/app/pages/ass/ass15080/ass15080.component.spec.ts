import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ASS15080Service } from '@service/api/ass/ass15080.service';
import { of } from 'rxjs';

import { ASS15080Component } from './ass15080.component';

describe('ASS15080Component', () => {
  let component: ASS15080Component;
  let fixture: ComponentFixture<ASS15080Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS15080Component],
      providers: [
        {
          provide: ASS15080Service,
          useValue: {
            queryASS15080: () =>
              of({
                Status: '0000',
                Data: [],
                TotalCount: 0,
                TotalPage: 0,
                Message: '',
                Error: null,
                Meta: { Timestamp: '', RequestId: '' },
              }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ASS15080Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
