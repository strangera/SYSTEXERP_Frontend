import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2D030Component } from './tls2d030.component';

describe('TLS2D030Component', () => {
  let component: TLS2D030Component;
  let fixture: ComponentFixture<TLS2D030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2D030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2D030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
