import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS11010Component } from './tls11010.component';

describe('TLS11010Component', () => {
  let component: TLS11010Component;
  let fixture: ComponentFixture<TLS11010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS11010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS11010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
