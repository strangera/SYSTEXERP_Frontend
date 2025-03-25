import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS12050Component } from './tls12050.component';

describe('TLS12050Component', () => {
  let component: TLS12050Component;
  let fixture: ComponentFixture<TLS12050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS12050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS12050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
