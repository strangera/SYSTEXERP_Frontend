import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2H010Component } from './tls2h010.component';

describe('TLS2H010Component', () => {
  let component: TLS2H010Component;
  let fixture: ComponentFixture<TLS2H010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2H010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2H010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
