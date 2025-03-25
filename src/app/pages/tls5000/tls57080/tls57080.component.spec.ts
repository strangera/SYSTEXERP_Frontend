import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS57080Component } from './tls57080.component';

describe('TLS57080Component', () => {
  let component: TLS57080Component;
  let fixture: ComponentFixture<TLS57080Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS57080Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS57080Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
