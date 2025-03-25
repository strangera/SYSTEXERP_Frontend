import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS27050Component } from './tls27050.component';

describe('TLS27050Component', () => {
  let component: TLS27050Component;
  let fixture: ComponentFixture<TLS27050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS27050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS27050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
