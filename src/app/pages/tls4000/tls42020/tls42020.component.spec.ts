import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS42020Component } from './tls42020.component';

describe('TLS42020Component', () => {
  let component: TLS42020Component;
  let fixture: ComponentFixture<TLS42020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS42020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS42020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
