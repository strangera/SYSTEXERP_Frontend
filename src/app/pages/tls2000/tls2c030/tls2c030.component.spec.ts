import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2C030Component } from './tls2c030.component';

describe('TLS2C030Component', () => {
  let component: TLS2C030Component;
  let fixture: ComponentFixture<TLS2C030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2C030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2C030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
