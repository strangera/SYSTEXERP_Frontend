import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS22030Component } from './tls22030.component';

describe('TLS22030Component', () => {
  let component: TLS22030Component;
  let fixture: ComponentFixture<TLS22030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS22030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS22030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
