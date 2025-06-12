import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tls26080Component } from './tls26080.component';

describe('Tls26080Component', () => {
  let component: Tls26080Component;
  let fixture: ComponentFixture<Tls26080Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tls26080Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tls26080Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
