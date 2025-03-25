import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS51050Component } from './tls51050.component';

describe('TLS51050Component', () => {
  let component: TLS51050Component;
  let fixture: ComponentFixture<TLS51050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS51050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS51050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
