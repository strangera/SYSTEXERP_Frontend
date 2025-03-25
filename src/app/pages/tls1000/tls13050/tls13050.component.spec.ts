import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS13050Component } from './tls13050.component';

describe('TLS13050Component', () => {
  let component: TLS13050Component;
  let fixture: ComponentFixture<TLS13050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS13050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS13050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
