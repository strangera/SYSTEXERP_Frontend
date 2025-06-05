import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS41050Component } from './tls41050.component';

describe('TLS41050Component', () => {
  let component: TLS41050Component;
  let fixture: ComponentFixture<TLS41050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS41050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS41050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
