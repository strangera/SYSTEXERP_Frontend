import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2A030Component } from './tls2a030.component';

describe('TLS2A030Component', () => {
  let component: TLS2A030Component;
  let fixture: ComponentFixture<TLS2A030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2A030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2A030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
