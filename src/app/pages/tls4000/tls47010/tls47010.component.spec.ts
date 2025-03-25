import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS47010Component } from './tls47010.component';

describe('TLS47010Component', () => {
  let component: TLS47010Component;
  let fixture: ComponentFixture<TLS47010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS47010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS47010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
