import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS26070Component } from './tls26070.component';

describe('TLS26070Component', () => {
  let component: TLS26070Component;
  let fixture: ComponentFixture<TLS26070Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS26070Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS26070Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
