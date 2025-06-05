import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS52030Component } from './tls52030.component';

describe('TLS52030Component', () => {
  let component: TLS52030Component;
  let fixture: ComponentFixture<TLS52030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS52030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS52030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
