import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2G040Component } from './tls2g040.component';

describe('TLS2G040Component', () => {
  let component: TLS2G040Component;
  let fixture: ComponentFixture<TLS2G040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2G040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2G040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
