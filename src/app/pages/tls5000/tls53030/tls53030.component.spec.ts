import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS53030Component } from './tls53030.component';

describe('TLS53030Component', () => {
  let component: TLS53030Component;
  let fixture: ComponentFixture<TLS53030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS53030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS53030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
