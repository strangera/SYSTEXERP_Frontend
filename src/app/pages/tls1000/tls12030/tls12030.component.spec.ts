import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS12030Component } from './tls12030.component';

describe('TLS12030Component', () => {
  let component: TLS12030Component;
  let fixture: ComponentFixture<TLS12030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS12030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS12030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
