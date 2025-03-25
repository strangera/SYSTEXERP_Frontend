import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS51090Component } from './tls51090.component';

describe('TLS51090Component', () => {
  let component: TLS51090Component;
  let fixture: ComponentFixture<TLS51090Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS51090Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS51090Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
