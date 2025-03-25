import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2C050Component } from './tls2c050.component';

describe('TLS2C050Component', () => {
  let component: TLS2C050Component;
  let fixture: ComponentFixture<TLS2C050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2C050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2C050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
