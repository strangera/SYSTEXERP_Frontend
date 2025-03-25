import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS41020Component } from './tls41020.component';

describe('TLS41020Component', () => {
  let component: TLS41020Component;
  let fixture: ComponentFixture<TLS41020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS41020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS41020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
