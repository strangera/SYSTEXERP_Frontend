import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS13070Component } from './tls13070.component';

describe('TLS13070Component', () => {
  let component: TLS13070Component;
  let fixture: ComponentFixture<TLS13070Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS13070Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS13070Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
