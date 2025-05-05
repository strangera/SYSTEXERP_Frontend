import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS45020Component } from './tls45020.component';

describe('TLS45020Component', () => {
  let component: TLS45020Component;
  let fixture: ComponentFixture<TLS45020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS45020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS45020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
