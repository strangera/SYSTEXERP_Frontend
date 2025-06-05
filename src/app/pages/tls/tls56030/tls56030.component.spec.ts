import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS56030Component } from './tls56030.component';

describe('TLS56030Component', () => {
  let component: TLS56030Component;
  let fixture: ComponentFixture<TLS56030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS56030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS56030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
