import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS23010Component } from './tls23010.component';

describe('TLS23010Component', () => {
  let component: TLS23010Component;
  let fixture: ComponentFixture<TLS23010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS23010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS23010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
