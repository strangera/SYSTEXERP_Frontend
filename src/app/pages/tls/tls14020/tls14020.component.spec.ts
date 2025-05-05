import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS14020Component } from './tls14020.component';

describe('TLS14020Component', () => {
  let component: TLS14020Component;
  let fixture: ComponentFixture<TLS14020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS14020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS14020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
