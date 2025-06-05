import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS52070Component } from './tls52070.component';

describe('TLS52070Component', () => {
  let component: TLS52070Component;
  let fixture: ComponentFixture<TLS52070Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS52070Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS52070Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
