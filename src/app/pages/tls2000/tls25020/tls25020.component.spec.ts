import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS25020Component } from './tls25020.component';

describe('TLS25020Component', () => {
  let component: TLS25020Component;
  let fixture: ComponentFixture<TLS25020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS25020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS25020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
