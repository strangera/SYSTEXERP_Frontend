import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2D050Component } from './tls2d050.component';

describe('TLS2D050Component', () => {
  let component: TLS2D050Component;
  let fixture: ComponentFixture<TLS2D050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2D050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2D050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
