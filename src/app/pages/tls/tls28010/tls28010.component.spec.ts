import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS28010Component } from './tls28010.component';

describe('TLS28010Component', () => {
  let component: TLS28010Component;
  let fixture: ComponentFixture<TLS28010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS28010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS28010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
