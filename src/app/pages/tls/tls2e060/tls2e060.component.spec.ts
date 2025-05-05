import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2E060Component } from './tls2e060.component';

describe('TLS2E060Component', () => {
  let component: TLS2E060Component;
  let fixture: ComponentFixture<TLS2E060Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2E060Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2E060Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
