import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tls13010Next3Component } from './tls13010-next3.component';

describe('Tls13010Next3Component', () => {
  let component: Tls13010Next3Component;
  let fixture: ComponentFixture<Tls13010Next3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tls13010Next3Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tls13010Next3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
