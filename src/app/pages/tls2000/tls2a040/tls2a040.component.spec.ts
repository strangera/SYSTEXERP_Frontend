import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2A040Component } from './tls2a040.component';

describe('TLS2A040Component', () => {
  let component: TLS2A040Component;
  let fixture: ComponentFixture<TLS2A040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2A040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2A040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
