import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2D070Component } from './tls2d070.component';

describe('TLS2D070Component', () => {
  let component: TLS2D070Component;
  let fixture: ComponentFixture<TLS2D070Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2D070Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2D070Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
