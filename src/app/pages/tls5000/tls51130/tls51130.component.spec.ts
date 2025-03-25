import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS51130Component } from './tls51130.component';

describe('TLS51130Component', () => {
  let component: TLS51130Component;
  let fixture: ComponentFixture<TLS51130Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS51130Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS51130Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
