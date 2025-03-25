import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2C010Component } from './tls2c010.component';

describe('TLS2C010Component', () => {
  let component: TLS2C010Component;
  let fixture: ComponentFixture<TLS2C010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2C010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2C010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
