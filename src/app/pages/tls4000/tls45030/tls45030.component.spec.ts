import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS45030Component } from './tls45030.component';

describe('TLS45030Component', () => {
  let component: TLS45030Component;
  let fixture: ComponentFixture<TLS45030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS45030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS45030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
