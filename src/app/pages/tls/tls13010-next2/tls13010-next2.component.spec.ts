import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS13010Next2Component } from './tls13010-next2.component';

describe('TLS13010Next2Component', () => {
  let component: TLS13010Next2Component;
  let fixture: ComponentFixture<TLS13010Next2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS13010Next2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS13010Next2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
