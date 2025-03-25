import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS51030Component } from './tls51030.component';

describe('TLS51030Component', () => {
  let component: TLS51030Component;
  let fixture: ComponentFixture<TLS51030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS51030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS51030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
