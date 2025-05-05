import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS27010Component } from './tls27010.component';

describe('TLS27010Component', () => {
  let component: TLS27010Component;
  let fixture: ComponentFixture<TLS27010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS27010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS27010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
