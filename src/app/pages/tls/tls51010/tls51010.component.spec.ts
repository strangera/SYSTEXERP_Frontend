import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS51010Component } from './tls51010.component';

describe('TLS51010Component', () => {
  let component: TLS51010Component;
  let fixture: ComponentFixture<TLS51010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS51010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS51010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
