import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS32030Component } from './tls32030.component';

describe('TLS32030Component', () => {
  let component: TLS32030Component;
  let fixture: ComponentFixture<TLS32030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS32030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS32030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
