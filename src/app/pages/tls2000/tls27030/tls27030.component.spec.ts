import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS27030Component } from './tls27030.component';

describe('TLS27030Component', () => {
  let component: TLS27030Component;
  let fixture: ComponentFixture<TLS27030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS27030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS27030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
