import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS56080Component } from './tls56080.component';

describe('TLS56080Component', () => {
  let component: TLS56080Component;
  let fixture: ComponentFixture<TLS56080Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS56080Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS56080Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
