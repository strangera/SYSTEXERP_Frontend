import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS51080Component } from './tls51080.component';

describe('TLS51080Component', () => {
  let component: TLS51080Component;
  let fixture: ComponentFixture<TLS51080Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS51080Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS51080Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
