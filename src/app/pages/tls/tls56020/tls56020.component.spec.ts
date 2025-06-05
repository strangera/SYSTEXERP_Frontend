import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS56020Component } from './tls56020.component';

describe('TLS56020Component', () => {
  let component: TLS56020Component;
  let fixture: ComponentFixture<TLS56020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS56020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS56020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
