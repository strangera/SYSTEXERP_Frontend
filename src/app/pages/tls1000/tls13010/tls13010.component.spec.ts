import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS13010Component } from './tls13010.component';

describe('TLS13010Component', () => {
  let component: TLS13010Component;
  let fixture: ComponentFixture<TLS13010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS13010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS13010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
