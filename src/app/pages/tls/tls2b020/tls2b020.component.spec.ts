import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2B020Component } from './tls2b020.component';

describe('TLS2B020Component', () => {
  let component: TLS2B020Component;
  let fixture: ComponentFixture<TLS2B020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2B020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2B020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
