import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS32020Component } from './tls32020.component';

describe('TLS32020Component', () => {
  let component: TLS32020Component;
  let fixture: ComponentFixture<TLS32020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS32020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS32020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
