import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS55050Component } from './tls55050.component';

describe('TLS55050Component', () => {
  let component: TLS55050Component;
  let fixture: ComponentFixture<TLS55050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS55050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS55050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
