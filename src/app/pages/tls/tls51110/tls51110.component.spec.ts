import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS51110Component } from './tls51110.component';

describe('TLS51110Component', () => {
  let component: TLS51110Component;
  let fixture: ComponentFixture<TLS51110Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS51110Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS51110Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
