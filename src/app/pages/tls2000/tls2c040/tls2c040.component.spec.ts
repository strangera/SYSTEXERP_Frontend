import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2C040Component } from './tls2c040.component';

describe('TLS2C040Component', () => {
  let component: TLS2C040Component;
  let fixture: ComponentFixture<TLS2C040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2C040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2C040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
