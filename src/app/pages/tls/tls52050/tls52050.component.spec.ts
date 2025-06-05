import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS52050Component } from './tls52050.component';

describe('TLS52050Component', () => {
  let component: TLS52050Component;
  let fixture: ComponentFixture<TLS52050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS52050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS52050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
