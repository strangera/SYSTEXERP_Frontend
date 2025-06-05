import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS57060Component } from './tls57060.component';

describe('TLS57060Component', () => {
  let component: TLS57060Component;
  let fixture: ComponentFixture<TLS57060Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS57060Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS57060Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
