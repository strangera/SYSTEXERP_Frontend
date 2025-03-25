import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS29010Component } from './tls29010.component';

describe('TLS29010Component', () => {
  let component: TLS29010Component;
  let fixture: ComponentFixture<TLS29010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS29010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS29010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
