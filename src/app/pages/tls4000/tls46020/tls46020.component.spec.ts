import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS46020Component } from './tls46020.component';

describe('TLS46020Component', () => {
  let component: TLS46020Component;
  let fixture: ComponentFixture<TLS46020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS46020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS46020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
