import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS56070Component } from './tls56070.component';

describe('TLS56070Component', () => {
  let component: TLS56070Component;
  let fixture: ComponentFixture<TLS56070Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS56070Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS56070Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
