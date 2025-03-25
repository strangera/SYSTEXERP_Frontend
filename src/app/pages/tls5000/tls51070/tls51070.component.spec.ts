import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS51070Component } from './tls51070.component';

describe('TLS51070Component', () => {
  let component: TLS51070Component;
  let fixture: ComponentFixture<TLS51070Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS51070Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS51070Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
