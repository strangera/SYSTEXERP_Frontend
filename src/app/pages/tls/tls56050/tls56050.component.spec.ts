import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS56050Component } from './tls56050.component';

describe('TLS56050Component', () => {
  let component: TLS56050Component;
  let fixture: ComponentFixture<TLS56050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS56050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS56050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
