import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS12040Component } from './tls12040.component';

describe('TLS12040Component', () => {
  let component: TLS12040Component;
  let fixture: ComponentFixture<TLS12040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS12040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS12040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
