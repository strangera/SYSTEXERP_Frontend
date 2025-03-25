import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS46030Component } from './tls46030.component';

describe('TLS46030Component', () => {
  let component: TLS46030Component;
  let fixture: ComponentFixture<TLS46030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS46030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS46030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
