import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS51020Component } from './tls51020.component';

describe('TLS51020Component', () => {
  let component: TLS51020Component;
  let fixture: ComponentFixture<TLS51020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS51020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS51020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
