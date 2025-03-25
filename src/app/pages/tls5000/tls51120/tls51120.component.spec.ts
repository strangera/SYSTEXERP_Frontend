import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS51120Component } from './tls51120.component';

describe('TLS51120Component', () => {
  let component: TLS51120Component;
  let fixture: ComponentFixture<TLS51120Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS51120Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS51120Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
