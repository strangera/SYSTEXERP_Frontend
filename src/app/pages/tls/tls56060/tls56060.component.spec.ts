import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS56060Component } from './tls56060.component';

describe('TLS56060Component', () => {
  let component: TLS56060Component;
  let fixture: ComponentFixture<TLS56060Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS56060Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS56060Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
