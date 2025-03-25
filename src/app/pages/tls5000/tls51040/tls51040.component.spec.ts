import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS51040Component } from './tls51040.component';

describe('TLS51040Component', () => {
  let component: TLS51040Component;
  let fixture: ComponentFixture<TLS51040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS51040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS51040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
