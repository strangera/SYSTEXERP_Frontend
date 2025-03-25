import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS24080Component } from './tls24080.component';

describe('TLS24080Component', () => {
  let component: TLS24080Component;
  let fixture: ComponentFixture<TLS24080Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS24080Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS24080Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
