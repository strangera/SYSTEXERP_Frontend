import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS51100Component } from './tls51100.component';

describe('TLS51100Component', () => {
  let component: TLS51100Component;
  let fixture: ComponentFixture<TLS51100Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS51100Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS51100Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
