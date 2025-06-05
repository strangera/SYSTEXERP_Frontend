import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS13060Component } from './tls13060.component';

describe('TLS13060Component', () => {
  let component: TLS13060Component;
  let fixture: ComponentFixture<TLS13060Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS13060Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS13060Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
