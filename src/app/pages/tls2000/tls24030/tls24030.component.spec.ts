import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS24030Component } from './tls24030.component';

describe('TLS24030Component', () => {
  let component: TLS24030Component;
  let fixture: ComponentFixture<TLS24030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS24030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS24030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
