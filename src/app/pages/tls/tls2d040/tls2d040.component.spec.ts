import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2D040Component } from './tls2d040.component';

describe('TLS2D040Component', () => {
  let component: TLS2D040Component;
  let fixture: ComponentFixture<TLS2D040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2D040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2D040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
