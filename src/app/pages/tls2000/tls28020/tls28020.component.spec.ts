import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS28020Component } from './tls28020.component';

describe('TLS28020Component', () => {
  let component: TLS28020Component;
  let fixture: ComponentFixture<TLS28020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS28020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS28020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
