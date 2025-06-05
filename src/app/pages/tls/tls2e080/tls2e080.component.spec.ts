import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2E080Component } from './tls2e080.component';

describe('TLS2E080Component', () => {
  let component: TLS2E080Component;
  let fixture: ComponentFixture<TLS2E080Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2E080Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2E080Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
