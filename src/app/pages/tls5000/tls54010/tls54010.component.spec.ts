import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS54010Component } from './tls54010.component';

describe('TLS54010Component', () => {
  let component: TLS54010Component;
  let fixture: ComponentFixture<TLS54010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS54010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS54010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
