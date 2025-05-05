import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2D020Component } from './tls2d020.component';

describe('TLS2D020Component', () => {
  let component: TLS2D020Component;
  let fixture: ComponentFixture<TLS2D020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2D020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2D020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
