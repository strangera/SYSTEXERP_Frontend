import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS55060Component } from './tls55060.component';

describe('TLS55060Component', () => {
  let component: TLS55060Component;
  let fixture: ComponentFixture<TLS55060Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS55060Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS55060Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
