import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS46050Component } from './tls46050.component';

describe('TLS46050Component', () => {
  let component: TLS46050Component;
  let fixture: ComponentFixture<TLS46050Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS46050Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS46050Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
