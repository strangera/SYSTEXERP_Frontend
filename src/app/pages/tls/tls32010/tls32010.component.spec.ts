import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS32010Component } from './tls32010.component';

describe('TLS32010Component', () => {
  let component: TLS32010Component;
  let fixture: ComponentFixture<TLS32010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS32010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS32010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
