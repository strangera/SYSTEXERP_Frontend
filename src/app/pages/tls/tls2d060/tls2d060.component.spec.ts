import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2D060Component } from './tls2d060.component';

describe('TLS2D060Component', () => {
  let component: TLS2D060Component;
  let fixture: ComponentFixture<TLS2D060Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2D060Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2D060Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
