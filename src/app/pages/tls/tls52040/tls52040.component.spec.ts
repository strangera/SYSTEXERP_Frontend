import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS52040Component } from './tls52040.component';

describe('TLS52040Component', () => {
  let component: TLS52040Component;
  let fixture: ComponentFixture<TLS52040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS52040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS52040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
