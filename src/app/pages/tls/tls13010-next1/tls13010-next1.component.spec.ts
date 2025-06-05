import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS13010Next1Component } from './tls13010-next1.component';

describe('TLS13010Next1Component', () => {
  let component: TLS13010Next1Component;
  let fixture: ComponentFixture<TLS13010Next1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS13010Next1Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS13010Next1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
