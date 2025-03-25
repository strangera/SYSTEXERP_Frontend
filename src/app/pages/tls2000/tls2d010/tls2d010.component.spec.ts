import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2D010Component } from './tls2d010.component';

describe('TLS2D010Component', () => {
  let component: TLS2D010Component;
  let fixture: ComponentFixture<TLS2D010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2D010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2D010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
