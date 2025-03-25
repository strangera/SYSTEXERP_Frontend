import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS12020Component } from './tls12020.component';

describe('TLS12020Component', () => {
  let component: TLS12020Component;
  let fixture: ComponentFixture<TLS12020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS12020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS12020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
