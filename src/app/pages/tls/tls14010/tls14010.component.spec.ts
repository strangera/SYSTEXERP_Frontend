import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS14010Component } from './tls14010.component';

describe('TLS14010Component', () => {
  let component: TLS14010Component;
  let fixture: ComponentFixture<TLS14010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS14010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS14010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
