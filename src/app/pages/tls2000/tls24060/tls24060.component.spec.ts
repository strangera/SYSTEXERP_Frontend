import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS24060Component } from './tls24060.component';

describe('TLS24060Component', () => {
  let component: TLS24060Component;
  let fixture: ComponentFixture<TLS24060Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS24060Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS24060Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
