import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS52060Component } from './tls52060.component';

describe('TLS52060Component', () => {
  let component: TLS52060Component;
  let fixture: ComponentFixture<TLS52060Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS52060Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS52060Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
