import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS57120Component } from './tls57120.component';

describe('TLS57120Component', () => {
  let component: TLS57120Component;
  let fixture: ComponentFixture<TLS57120Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS57120Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS57120Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
