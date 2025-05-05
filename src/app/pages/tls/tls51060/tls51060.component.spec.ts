import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS51060Component } from './tls51060.component';

describe('TLS51060Component', () => {
  let component: TLS51060Component;
  let fixture: ComponentFixture<TLS51060Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS51060Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS51060Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
