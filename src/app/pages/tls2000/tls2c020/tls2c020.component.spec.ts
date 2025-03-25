import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2C020Component } from './tls2c020.component';

describe('TLS2C020Component', () => {
  let component: TLS2C020Component;
  let fixture: ComponentFixture<TLS2C020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2C020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2C020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
