import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS28050Component } from './tls28050.component';

describe('TLS28050Component', () => {
  let component: TLS28050Component;
  let fixture: ComponentFixture<TLS28050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS28050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS28050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
