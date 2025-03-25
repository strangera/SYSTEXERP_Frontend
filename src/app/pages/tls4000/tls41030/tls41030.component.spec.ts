import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS41030Component } from './tls41030.component';

describe('TLS41030Component', () => {
  let component: TLS41030Component;
  let fixture: ComponentFixture<TLS41030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS41030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS41030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
