import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS32060Component } from './tls32060.component';

describe('TLS32060Component', () => {
  let component: TLS32060Component;
  let fixture: ComponentFixture<TLS32060Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS32060Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS32060Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
