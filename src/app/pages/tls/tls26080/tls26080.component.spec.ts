import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS26080Component } from './tls26080.component';

describe('Tls26080Component', () => {
  let component: TLS26080Component;
  let fixture: ComponentFixture<TLS26080Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS26080Component]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TLS26080Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
