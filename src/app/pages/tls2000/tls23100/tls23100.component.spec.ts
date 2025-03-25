import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS23100Component } from './tls23100.component';

describe('TLS23100Component', () => {
  let component: TLS23100Component;
  let fixture: ComponentFixture<TLS23100Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS23100Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS23100Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
