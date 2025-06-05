import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS24070Component } from './tls24070.component';

describe('TLS24070Component', () => {
  let component: TLS24070Component;
  let fixture: ComponentFixture<TLS24070Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS24070Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS24070Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
