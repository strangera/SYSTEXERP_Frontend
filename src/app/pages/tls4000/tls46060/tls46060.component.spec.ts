import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS46060Component } from './tls46060.component';

describe('TLS46060Component', () => {
  let component: TLS46060Component;
  let fixture: ComponentFixture<TLS46060Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS46060Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS46060Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
